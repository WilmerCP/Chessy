//Logic for websockets and real time chess matches

const gameManager = require('./games');

let socketManager = {}

socketManager.queue = [];

socketManager.connectedSockets = {}

socketManager.handler = function (socket) {

    console.log('Player connected: ' + socket.id);

    socket.on('findgame', (data) => {

        let player = {}
        player.id = socket.id;
        player.name = data.name;

        socketManager.queue.push(player);

        socketManager.connectedSockets[socket.id] = socket;

        console.log('Player added to the queue: ' + player.name);

        if (socketManager.queue.length >= 2) {

            let player1 = socketManager.queue.shift();
            let player2 = socketManager.queue.shift();

            let roomid = player1.id + '-' + player2.id;

            socketManager.connectedSockets[player1.id].join(roomid);
            socketManager.connectedSockets[player2.id].join(roomid);

            //Assign black or white randomly
            const randomNum = Math.floor(Math.random() * 2) + 1;

            if (randomNum == 1) {

                socketManager.io.to(player1.id).emit('startGame', { 'opponent': player2.name, 'color': 'black' });
                socketManager.io.to(player2.id).emit('startGame', { 'opponent': player1.name, 'color': 'white' });

                gameManager.initGame(roomid, player2.id, player1.id);

            } else {

                socketManager.io.to(player1.id).emit('startGame', { 'opponent': player2.name, 'color': 'white' });
                socketManager.io.to(player2.id).emit('startGame', { 'opponent': player1.name, 'color': 'black' });

                gameManager.initGame(roomid, player1.id, player2.id);
            }

            setTimeout(() => {

                const room = socketManager.io.sockets.adapter.rooms.get(roomid);

                if (room) {
                    room.forEach((socketId) => {
                        const socket = socketManager.io.sockets.sockets.get(socketId); 
                        socket.disconnect();  
                    });
                }

                delete socketManager.io.sockets.adapter.rooms[roomid];
                gameManager.deleteGame(roomid);

            }, 1000 * 60 * 23);

        }

    });

    socket.on('drawRequest', () =>{

        let room = typeof (Array.from(socket.rooms)[1]) == 'string' ? Array.from(socket.rooms)[1] : false;
        let playerId = socket.id;

        let data = {
            userId: playerId,
            matchId: room
        }

        if(room){

            let validRequest = gameManager.drawRequest(data);

            if(validRequest){

                socket.to(room).except(socket.id).emit('drawRequest');

            }

            if(validRequest && gameManager.checkMutualDraw(room)){

                socketManager.io.to(room).emit('draw', {'reason': 'Mutual accord'})

            }

        }

    })

    socket.on('resign', () =>{

        let room = typeof (Array.from(socket.rooms)[1]) == 'string' ? Array.from(socket.rooms)[1] : false;
        let playerId = socket.id;

        let data = {
            userId: playerId,
            matchId: room
        }

        if(room){

            let winner = gameManager.resignation(data);

            if(winner){

                socketManager.io.to(room).emit('gameover', {'reason': 'resignation', 'winner': winner})

            }

        }

    })

    socket.on('move', (data) => {

        let room = typeof (Array.from(socket.rooms)[1]) == 'string' ? Array.from(socket.rooms)[1] : false;

        data.playerId = socket.id;
        data.roomId = room;

        if (gameManager.moveRequest(data) && room) {

            delete data.playerId;
            delete data.roomId;

            let castle = gameManager.notifyCastling(room);

            if(castle){

                socketManager.io.to(room).emit('castle',{'square':castle});

            }else{

                socketManager.io.to(room).emit('moveAccepted', data);

            }

            let winner = gameManager.checkmate(room);

            if(winner){

                socketManager.io.to(room).emit('gameover', {'reason': 'checkmate', 'winner': winner})

            }

            let draw = gameManager.draw(room);

            if(draw){

                socketManager.io.to(room).emit('draw', {'reason': draw})

            }

            let enPassant = gameManager.notifyEnPassant(room);

            if(enPassant){

                socketManager.io.to(room).emit('enPassant',{'square':enPassant});

            }

            let promotion = gameManager.notifyPromotion(room);

            if(promotion){

                socketManager.io.to(room).emit('promotion',{'square': data.to, 'piece': promotion});

            }

        }

    });

    socket.on('disconnect', () => {

        console.log('Player disconnected: ' + socket.id);

        delete socketManager.connectedSockets[socket.id];

        socketManager.queue.forEach(player => {

            if (player.id == socket.id) {

                let index = socketManager.queue.indexOf(player);

                socketManager.queue.splice(index, 1);

            }

        });


    });

}

socketManager.init = function (ioObject) {

    gameManager.generateZobrist();
    gameManager.printZobristTable();

    socketManager.io = ioObject;
    socketManager.io.on('connection', socketManager.handler);

    console.log('sockets initialized');

}

module.exports = {

    'init': socketManager.init

}