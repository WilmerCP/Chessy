//file to handle all games logic

const EventEmitter = require('events');

let gameManager = {}

gameManager.timeoutEmitter = new EventEmitter();

gameManager.ongoingGames = {}

gameManager.generateZobrist = function () {

    gameManager.zobristTable = {}

    gameManager.zobristTable.enPassant = {

        a: gameManager.randomNumber(),
        b: gameManager.randomNumber(),
        c: gameManager.randomNumber(),
        d: gameManager.randomNumber(),
        e: gameManager.randomNumber(),
        f: gameManager.randomNumber(),
        g: gameManager.randomNumber(),
        h: gameManager.randomNumber(),

    }

    gameManager.zobristTable.turn = gameManager.randomNumber();

    gameManager.zobristTable.castlingRights = {

        ws: gameManager.randomNumber(),
        wl: gameManager.randomNumber(),
        bs: gameManager.randomNumber(),
        bl: gameManager.randomNumber(),

    }

    gameManager.zobristTable.squares = [];

    for (let i = 0; i < 8; i++) {

        gameManager.zobristTable.squares[i] = []

    }

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            gameManager.zobristTable.squares[i][j] = {

                p: gameManager.randomNumber(),
                n: gameManager.randomNumber(),
                b: gameManager.randomNumber(),
                r: gameManager.randomNumber(),
                q: gameManager.randomNumber(),
                k: gameManager.randomNumber(),
                P: gameManager.randomNumber(),
                N: gameManager.randomNumber(),
                B: gameManager.randomNumber(),
                R: gameManager.randomNumber(),
                Q: gameManager.randomNumber(),
                K: gameManager.randomNumber()

            }

        }

    }


}

gameManager.randomNumber = function () {

    return Math.floor(Math.random() * 2 ** 32);

}

gameManager.printZobristTable = function () {
    //console.log("Zobrist Table Overview:");

    // Check turn
    //console.log("Turn value:", gameManager.zobristTable.turn);

    // Check castling rights
    //console.log("\nCastling Rights:");
    Object.entries(gameManager.zobristTable.castlingRights).forEach(([key, value]) => {
        //console.log(`${key}: ${value}`);
    });

    // Check en passant values
    //console.log("\nEn Passant Values:");
    Object.entries(gameManager.zobristTable.enPassant).forEach(([key, value]) => {
        //console.log(`${key}: ${value}`);
    });

    // Check for repeated values in squares
    //console.log("\nSquare Values - Checking for Repeats:");
    let allValues = [];

    gameManager.zobristTable.squares.forEach((row, i) => {
        row.forEach((square, j) => {
            Object.entries(square).forEach(([piece, value]) => {
                allValues.push({
                    location: `[${i},${j}]`,
                    piece: piece,
                    value: value
                });
            });
        });
    });

    // Find duplicates
    const valueCount = {};
    allValues.forEach(item => {
        if (!valueCount[item.value]) {
            valueCount[item.value] = [];
        }
        valueCount[item.value].push(`${item.location} - ${item.piece}`);
    });

    // Print duplicates
    //console.log("\nDuplicate Values:");
    Object.entries(valueCount).forEach(([value, locations]) => {
        if (locations.length > 1) {
            //console.log(`Value ${value} appears in: ${locations.join(', ')}`);
        }
    });

    // Total number of unique values
    //console.log("\nTotal Unique Values:", Object.keys(valueCount).length);
}

gameManager.initGame = function (gameid, whiteId, blackId) {

    let game = {

    }

    game.squares = []

    for (let i = 0; i < 8; i++) {

        game.squares[i] = []

    }

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            if (j == 1) { // Fila 2

                game.squares[i][j] = "peonblanco";

            } else if (j == 6) { // Fila 7

                game.squares[i][j] = "peonnegro";

            } else if (j == 0) { //Fila 1

                if (i == 0 || i == 7) {

                    game.squares[i][j] = "torreblanca";

                }

                if (i == 1 || i == 6) {

                    game.squares[i][j] = "caballoblanco";

                }

                if (i == 2 || i == 5) {

                    game.squares[i][j] = "afilblanco";

                }

                if (i == 3) {

                    game.squares[i][j] = "reinablanca";

                }

                if (i == 4) {

                    game.squares[i][j] = "reyblanco";

                }

            } else if (j == 7) { //Fila 8

                if (i == 0 || i == 7) {

                    game.squares[i][j] = "torrenegra";

                }

                if (i == 1 || i == 6) {

                    game.squares[i][j] = "caballonegro";

                }

                if (i == 2 || i == 5) {

                    game.squares[i][j] = "afilnegro";

                }

                if (i == 3) {

                    game.squares[i][j] = "reinanegra";

                }

                if (i == 4) {

                    game.squares[i][j] = "reynegro";

                }

            } else {

                game.squares[i][j] = "vacio";

            }

        }

    }

    game.jumpRightWhite = [true, true, true, true, true, true, true, true];
    game.jumpRightBlack = [true, true, true, true, true, true, true, true];

    game.whiteLongCastle = true;
    game.blackLongCastle = true;
    game.whiteShortCastle = true;
    game.blackShortCastle = true;

    game.next = 'white';

    game.whiteId = whiteId;
    game.blackId = blackId;
    game.winner = false;
    game.moveCount = 0;

    gameManager.ongoingGames[gameid] = [];

    game.map = new Map();

    let hash = gameManager.getHash(game, gameid);

    game.map.set(hash, 1);

    game.drawRequests = {};

    game.timeAuthority = {

        'remainingwhite': 1000 * 60 * 5,
        'remainingblack': 1000 * 60 * 5,
        'timerwhite': null,
        'timerblack':null,
        'lastUpdate':null

    }

    gameManager.ongoingGames[gameid].push(game);

    return gameManager.setTimer(gameid,'white');

    //console.log('New match created: ' + gameid);

    //console.log(game);

    //console.log(Array.from(game.map)); 

}

gameManager.setTimer = function (matchId, currentPlayer){

    let match = gameManager.ongoingGames[matchId];
    let state = match[0];
    let timeAuthority = state.timeAuthority;

    //Obtain current time in milliseconds
    let now = Date.now();

    let previous = currentPlayer == 'white' ? 'black' : 'white';

    if(timeAuthority['timer'+previous] !== null){

        //stop previous timer if exists
        clearTimeout(timeAuthority['timer'+previous]);
        
        //Update the remaining time of previous player
        timeAuthority['remaining'+previous] -= (now - timeAuthority.lastUpdate); 

        timeAuthority['timer'+previous] = null;

    }

    //set a new timer with the remaining time of the player

    timeAuthority['timer'+currentPlayer] = setTimeout(()=>{

        //console.log("The match is finished by timeout and the winner is "+previous);

        gameManager.timeoutEmitter.emit('timeout',{

            matchId: matchId,
            winner: previous

        })

    },timeAuthority['remaining'+currentPlayer]);

    //Update the last Update time

    timeAuthority.lastUpdate = now;

    //return the time the new timer started

    return now;

}

gameManager.getHash = function (state, matchId) {

    let table = gameManager.zobristTable;
    let board = state.squares;

    let hash = 0;

    //console.log("Hash Generation Debug:");
    //console.log("Next Player:", state.next);

    if (state.next == 'black') {

        hash ^= table.turn;
        //console.log("Turn modification applied:", table.turn);

    }

    //console.log('Debug logs for enpassant evaluation:');

    if (typeof (state.lastMove) != 'undefined') {

        if (state.lastMove.piece.indexOf('peonblanco') > -1) {

            let from_file = gameManager.letterToNumber(state.lastMove.from[0]) - 1;
            let from_rank = parseInt(state.lastMove.from[1]) - 1;

            let to_file = gameManager.letterToNumber(state.lastMove.to[0]) - 1;
            let to_rank = parseInt(state.lastMove.to[1]) - 1;

            if (Math.abs(from_rank - to_rank) == 2 && to_file == from_file) {

                if (to_file > 0 && board[to_file - 1][to_rank].includes('peonnegro')) {

                    let newfrom = gameManager.getSquareName(to_file, 4);
                    let newto = gameManager.getSquareName(from_file + 1, 3);

                    //console.log('ENPASSANT POSSIBLE FROM: '+newfrom);
                    //console.log('ENPASSANT POSSIBLE TO:' +newto);

                    if (gameManager.enPassant(matchId, newfrom, newto) && gameManager.updateState(matchId, newfrom, newto, false, false)) {

                        hash ^= table.enPassant[state.lastMove.from[0]];
                        //console.log('En passant can be done by black in file: '+state.lastMove.from[0]);
                        //console.log(table.enPassant[state.lastMove.from[0]]+' XORed to the hash');

                    }

                }

                if (to_file < 7 && board[to_file + 1][to_rank].includes('peonnegro')) {

                    let newfrom = gameManager.getSquareName(to_file + 2, 4);
                    let newto = gameManager.getSquareName(from_file + 1, 3);

                    //console.log('ENPASSANT POSSIBLE FROM: '+newfrom);
                    //console.log('ENPASSANT POSSIBLE TO:' +newto);

                    if (gameManager.enPassant(matchId, newfrom, newto) && gameManager.updateState(matchId, newfrom, newto, false, false)) {

                        hash ^= table.enPassant[state.lastMove.from[0]];
                        //console.log('En passant can be done by black in file: '+state.lastMove.from[0]);
                        //console.log(table.enPassant[state.lastMove.from[0]]+' XORed to the hash');

                    }

                }

            }


        }

        if (state.lastMove.piece.indexOf('peonnegro') > -1) {

            let from_file = gameManager.letterToNumber(state.lastMove.from[0]) - 1;
            let from_rank = parseInt(state.lastMove.from[1]) - 1;

            let to_file = gameManager.letterToNumber(state.lastMove.to[0]) - 1;
            let to_rank = parseInt(state.lastMove.to[1]) - 1;

            if (Math.abs(from_rank - to_rank) == 2 && to_file == from_file) {

                if (to_file > 0 && board[to_file - 1][to_rank].includes('peonblanco')) {

                    let newfrom = gameManager.getSquareName(to_file, 5);
                    let newto = gameManager.getSquareName(to_file + 1, 6);

                    if (gameManager.enPassant(matchId, newfrom, newto) && gameManager.updateState(matchId, newfrom, newto, false, false)) {

                        hash ^= table.enPassant[state.lastMove.from[0]];
                        //console.log('En passant can be done by white in file: '+state.lastMove.from[0]);
                        //console.log(table.enPassant[state.lastMove.from[0]]+' XORed to the hash');

                    }

                }

                if (to_file < 7 && board[to_file + 1][to_rank].includes('peonblanco')) {

                    let newfrom = gameManager.getSquareName(to_file + 2, 5);
                    let newto = gameManager.getSquareName(from_file + 1, 6);

                    if (gameManager.enPassant(matchId, newfrom, newto) && gameManager.updateState(matchId, newfrom, newto, false, false)) {

                        hash ^= table.enPassant[state.lastMove.from[0]];
                        //console.log('En passant can be done by white in file: '+state.lastMove.from[0]);
                        //console.log(table.enPassant[state.lastMove.from[0]]+' XORed to the hash');

                    }

                }

            }


        }

    }

    //console.log("Castling Rights Hash Modifications:");

    if (state.whiteLongCastle) {

        hash ^= table.castlingRights.wl;
        //console.log("White Long Castle: XORed with", table.castlingRights.wl);

    }

    if (state.whiteShortCastle) {

        hash ^= table.castlingRights.ws;
        //console.log("White Short Castle: XORed with", table.castlingRights.ws);

    }

    if (state.blackLongCastle) {

        hash ^= table.castlingRights.bl;
        //console.log("Black Long Castle: XORed with", table.castlingRights.bl);

    }

    if (state.blackShortCastle) {

        hash ^= table.castlingRights.bs;
        //console.log("Black Short Castle: XORed with", table.castlingRights.bs);

    }

    //console.log("Piece Placement Hash Contributions:");

    //console.log("Piece Placement Hash Contributions:");
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let piece = board[i][j];
            if (piece !== 'vacio') {
                let pieceHash = 0;
                switch (piece) {
                    case 'peonblanco':
                        pieceHash = table.squares[i][j].p;
                        break;
                    case 'peonnegro':
                        pieceHash = table.squares[i][j].P;
                        break;
                    case 'reyblanco':
                        pieceHash = table.squares[i][j].k;
                        break;
                    case 'reynegro':
                        pieceHash = table.squares[i][j].K;
                        break;
                    case 'reinablanca':
                        pieceHash = table.squares[i][j].q;
                        break;
                    case 'reinanegra':
                        pieceHash = table.squares[i][j].Q;
                        break;
                    case 'afilblanco':
                        pieceHash = table.squares[i][j].b;
                        break;
                    case 'afilnegro':
                        pieceHash = table.squares[i][j].B;
                        break;
                    case 'caballoblanco':
                        pieceHash = table.squares[i][j].n;
                        break;
                    case 'caballonegro':
                        pieceHash = table.squares[i][j].N;
                        break;
                    case 'torreblanca':
                        pieceHash = table.squares[i][j].r;
                        break;
                    case 'torrenegra':
                        pieceHash = table.squares[i][j].R;
                        break;
                    default:
                        // Optionally log unexpected pieces
                        //console.warn(`Unexpected piece type: ${piece} at [${i},${j}]`);
                        pieceHash = 0;
                }
                hash ^= pieceHash;
                //console.log(`${piece} at [${i},${j}]: XORed with ${pieceHash}`);
            }
        }
    }

    //console.log('Final generated hash:');

    //console.log(hash);

    return hash;


}

gameManager.deleteGame = function (gameid) {


    delete gameManager.ongoingGames[gameid];

}

//returns the color of the user
gameManager.userColor = function (matchId, id) {

    let match = gameManager.ongoingGames[matchId];

    if (match[0].whiteId == id) {

        return 'white';

    } else if (match[0].blackId == id) {

        return 'black';

    } else {

        return 'none';

    }

}

//If the king is not in check,  returns true and updates the state of the game when flag is true

gameManager.updateState = function (matchId, from, to, flag, promotion) {

    let file1 = gameManager.letterToNumber(from[0]) - 1;
    let rank1 = from[1] - 1;

    let file2 = gameManager.letterToNumber(to[0]) - 1;
    let rank2 = to[1] - 1;

    let match = gameManager.ongoingGames[matchId];
    let index = match.length - 1;

    let state = match[index];

    if(index == 0){

        state

    }

    let copy = JSON.parse(
        JSON.stringify(state, (key, value) => {
            if (key === 'timeAuthority') {
                return undefined; // Exclude the `timer` property
            }
            return value; // Keep other properties
        })
    );

    let piece = gameManager.pieceName(matchId, from);

    promotion = typeof promotion == 'string' ? promotion : false;

    if (piece.includes('peon') && file1 != file2 && gameManager.pieceColor(matchId, to) == false) {

        copy.squares[file1][rank1] = 'vacio';
        copy.squares[file2][rank2] = piece;

        if (piece.includes('blanco')) {

            copy.squares[file2][rank2 - 1] = 'vacio';
            copy.enPassant = gameManager.getSquareName(file2 + 1, rank2);

        } else {

            copy.squares[file2][rank2 + 1] = 'vacio';
            copy.enPassant = gameManager.getSquareName(file2 + 1, rank2 + 2);

        }

    } else {

        copy.squares[file1][rank1] = 'vacio';
        copy.squares[file2][rank2] = piece;

        if (promotion) {

            copy.squares[file2][rank2] = promotion;
            copy.promotion = promotion;

        } else {

            copy.promotion = false;

        }

        copy.enPassant = false;
        copy.castle = false;

    }

    if (copy.next == 'black') {

        copy.next = 'white';
        copy.moveCount = copy.moveCount + 1;

    } else {

        copy.next = 'black';

    }

    if (piece.indexOf('peon') > -1) {

        copy.moveCount = 0;

    }

    if (gameManager.pieceName(matchId, to) != 'vacio') {

        copy.moveCount = 0;

    }

    if (piece.indexOf('peonblanco') > -1) {

        let pn = parseInt(piece[piece.length - 1]);

        copy.jumpRightWhite[pn - 1] = false;

    }

    if (piece.indexOf('peonnegro') > -1) {

        let pn = parseInt(piece[piece.length - 1]);

        copy.jumpRightBlack[pn - 1] = false;

    }

    //Considerations for castling rights

    if (copy.whiteLongCastle || copy.whiteShortCastle || copy.blackLongCastle || copy.blackShortCastle) {


        let attackedPiece = gameManager.pieceName(matchId, to)

        if (piece == 'reyblanco' && attackedPiece.indexOf('torreblanca') > -1) {

            switch (to) {

                case 'h1':
                    copy.whiteShortCastle = false;
                    copy.squares[5][0] = 'torreblanca';
                    copy.squares[6][0] = 'reyblanco';
                    copy.castle = 'h1';

                    break;
                case 'a1':
                    copy.whiteLongCastle = false;
                    copy.squares[3][0] = 'torreblanca';
                    copy.squares[2][0] = 'reyblanco';
                    copy.castle = 'a1';

            }

            copy.squares[file2][rank2] = 'vacio';

        }

        if (piece == 'reynegro' && attackedPiece.indexOf('torrenegra') > -1) {

            switch (to) {

                case 'h8':
                    copy.blackShortCastle = false;
                    copy.squares[5][7] = 'torrenegra';
                    copy.squares[6][7] = 'reynegro';
                    copy.castle = 'h8';
                    break;
                case 'a8':
                    copy.blackLongCastle = false;
                    copy.squares[3][7] = 'torrenegra';
                    copy.squares[2][7] = 'reynegro';
                    copy.castle = 'a8';

            }

            copy.squares[file2][rank2] = 'vacio';

        }

        if (from == 'e1') {

            copy.whiteLongCastle = false;
            copy.whiteShortCastle = false;

        }

        if (from == 'e8') {

            copy.blackLongCastle = false;
            copy.blackShortCastle = false;

        }

        if (to == 'a1' || from == 'a1') {

            copy.whiteLongCastle = false;

        }

        if (to == 'h1' || from == 'h1') {

            copy.whiteShortCastle = false;

        }

        if (to == 'h8' || from == 'h8') {

            copy.blackShortCastle = false;

        }

        if (to == 'a8' || from == 'a8') {

            copy.blackLongCastle = false;

        }

    }

    //Check if the new position would keep the king in check

    let kingSquare = gameManager.getKingSquare(copy.squares, state.next);


    if (!gameManager.squareInCheck(copy.squares, kingSquare, state.next)) {

        if (flag) {

            copy.lastMove = {

                'piece': piece,
                'from': from,
                'to': to

            }

            copy.drawRequests = {};

            gameManager.ongoingGames[matchId].push(copy);

            let hash = gameManager.getHash(copy, matchId);

            if (gameManager.ongoingGames[matchId][0].map.has(hash)) {

                let count = gameManager.ongoingGames[matchId][0].map.get(hash) + 1;

                gameManager.ongoingGames[matchId][0].map.set(hash, count);

                //console.log('incrementing existing hash');

            } else {

                gameManager.ongoingGames[matchId][0].map.set(hash, 1);

            }

            gameManager.setTimer(matchId,copy.next);

            //console.log(copy);
            //console.log(Array.from(gameManager.ongoingGames[matchId][0].map));

        }

        return true;

    } else {

        return false;

    }

}

//returns the color who was to move next in a match
gameManager.currentTurn = function (matchId) {

    let match = gameManager.ongoingGames[matchId];

    let length = match.length;

    return match[length - 1].next;


}

//converts letter of the file to a index number

gameManager.letterToNumber = function (letter) {

    return letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

}

//returns the name of the piece on a square

gameManager.pieceName = function (matchId, square) {

    let file = gameManager.letterToNumber(square[0]);
    let rank = square[1];

    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];

    return state.squares[file - 1][rank - 1];

}

//returns the color of the piece on a square or false if there is none

gameManager.pieceColor = function (matchId, square) {

    let piece = gameManager.pieceName(matchId, square);

    if (piece.includes('blanca') || piece.includes('blanco')) {

        return 'white';

    } else if (piece.includes('negra') || piece.includes('negro')) {

        return 'black';

    } else {

        return false;

    }

}


//checks if the user is trying to move their own pieces
gameManager.validColor = function (matchId, from, to, id) {

    if (gameManager.currentTurn(matchId) == gameManager.userColor(matchId, id) && gameManager.userColor(matchId, id) == gameManager.pieceColor(matchId, from)) {

        return true;

    } else {

        return false;

    }


}

//Receives the board distribution and returns square location of the king specified by color

gameManager.getKingSquare = function (board, color) {

    let pieceName = color == 'white' ? 'reyblanco' : 'reynegro';

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            if (board[i][j] == pieceName) {

                return gameManager.getSquareName(i + 1, j + 1);

            }

        }

    }

}

//Converts index numbers into square name format receiving files from 1 to 8

gameManager.getSquareName = function (file, rank) {

    let file_letter = String.fromCharCode(97 + file - 1);

    return file_letter + rank;

}

//Checks if there is a piece in between two squares diagonally

gameManager.noObstaclesDiagonal = function (matchId, from, to) {

    //not necessary here to substract 1
    let from_file = gameManager.letterToNumber(from[0]);
    let from_rank = parseInt(from[1]);

    let to_file = gameManager.letterToNumber(to[0]);
    let to_rank = parseInt(to[1]);

    let steps = Math.abs(to_file - from_file);

    //North east
    if (to_file > from_file && to_rank > from_rank) {

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file + i, from_rank + i)) !== false) {

                return false;

            }

        }

        //North west
    } else if (to_file < from_file && to_rank > from_rank) {

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file - i, from_rank + i)) !== false) {

                return false;

            }

        }

        //South west
    } else if (to_file < from_file && to_rank < from_rank) {

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file - i, from_rank - i)) !== false) {

                return false;

            }

        }

        //south east
    } else if (to_file > from_file && to_rank < from_rank) {

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file + i, from_rank - i)) !== false) {

                return false;

            }

        }


    }

    return true;

}


//Checks if there is a piece in between two squares

gameManager.noObstacles = function (matchId, from, to) {

    //not necessary here to substract 1
    let from_file = gameManager.letterToNumber(from[0]);
    let from_rank = parseInt(from[1]);

    let to_file = gameManager.letterToNumber(to[0]);
    let to_rank = parseInt(to[1]);


    //North
    if (to_rank > from_rank && to_file == from_file) {

        let steps = Math.abs(to_rank - from_rank);

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file, from_rank + i)) !== false) {

                return false;

            }

        }

        //East
    } else if (to_rank == from_rank && to_file > from_file) {

        let steps = Math.abs(to_file - from_file);

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file + i, from_rank)) !== false) {

                return false;

            }

        }

        //South
    } else if (to_rank < from_rank && to_file == from_file) {

        let steps = Math.abs(from_rank - to_rank);

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file, from_rank - i)) !== false) {

                return false;

            }

        }

        //West
    } else if (to_rank == from_rank && to_file < from_file) {

        let steps = Math.abs(from_file - to_file);

        for (let i = 1; i < steps; i++) {

            if (gameManager.pieceColor(matchId, gameManager.getSquareName(from_file - i, from_rank)) !== false) {

                return false;

            }

        }


    }

    return true;

}

//Evaluates the movement of a king

gameManager.kingMove = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    let game = gameManager.ongoingGames[matchId];
    let board = game[game.length - 1].squares;
    let color = game[game.length - 1].next;

    if (Math.abs(to_file - from_file) <= 1 && Math.abs(to_rank - from_rank) <= 1 && gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        return !gameManager.squareInCheck(board, to, color);

    } else {

        return false;

    }

}

//Evaluates the movement of a rook

gameManager.rookMove = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;


    //check if the target square is empty or has an opposite color piece
    if (gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        //check if the rook is trying to move straight
        if (to_file == from_file && to_rank !== from_rank || to_file !== from_file && to_rank == from_rank) {

            return gameManager.noObstacles(matchId, from, to);

        } else {

            return false;

        }


    } else {


        return false;

    }

}

//Evaluates the movement of a bishop

gameManager.bishopMove = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;


    //check if the target square is empty or has an opposite color piece
    if (gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        //check if the bishop is trying to move in a diagonal
        if (Math.abs(to_file - from_file) == Math.abs(to_rank - from_rank)) {

            return gameManager.noObstaclesDiagonal(matchId, from, to);

        } else {

            return false;

        }


    } else {


        return false;

    }

}

//Evaluates the movement of a knight

gameManager.knightMove = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    if (gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        if (Math.abs(from_file - to_file) == 2 && Math.abs(from_rank - to_rank) == 1) {

            return true;

        } else if (Math.abs(from_file - to_file) == 1 && Math.abs(from_rank - to_rank) == 2) {

            return true;

        } else {

            return false;

        }


    } else {


        return false;

    }

}

//Evaluates the movement of a queen
gameManager.queenMove = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;


    //check if the target square is empty or has an opposite color piece
    if (gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        //check if the queen is trying to move in a diagonal
        if (Math.abs(to_file - from_file) == Math.abs(to_rank - from_rank)) {

            return gameManager.noObstaclesDiagonal(matchId, from, to);

        } else if (to_rank == from_rank || to_file == from_file) {

            return gameManager.noObstacles(matchId, from, to);

        } else {

            return false;

        }


    } else {


        return false;

    }

}


//Evaluates the case of a pawn moving two squares to the front

gameManager.pawnJump = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    let pieceColor = gameManager.pieceColor(matchId, from);

    let match = gameManager.ongoingGames[matchId];
    let jumpRights = pieceColor == 'white' ? match[match.length - 1].jumpRightWhite : match[match.length - 1].jumpRightBlack;

    if (from_file == to_file && gameManager.pieceColor(matchId, to) == false) {

        if (to_rank - from_rank == 2 && pieceColor == 'white') {

            let middleSquare = gameManager.getSquareName(to_file+1 ,to_rank);
            //console.log("Middle square : "+middleSquare);

            if(gameManager.pieceColor(matchId,middleSquare) == false){

                return jumpRights[from_file];

            }


        } else if (to_rank - from_rank == -2 && pieceColor == 'black') {

            let middleSquare = gameManager.getSquareName(to_file+1 ,to_rank + 2);
            //console.log("Middle square : "+middleSquare);

            if(gameManager.pieceColor(matchId,middleSquare) == false){

                return jumpRights[from_file];

            }

        } else {

            return false;

        }

    } else {

        return false;

    }

}

//Evaluates the case of a pawn eating en passant, used for zobrist hashing

gameManager.enPassantPossible = function (state, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    let lastMove = state.lastMove;

    let board = state.squares;

    if (Math.abs(from_file - to_file) == 1 && board[to_file][to_rank].indexOf('vacio') > -1) {

        if (to_rank - from_rank == 1
            && board[from_file][from_rank].indexOf('peonblanco') > -1
            && from_rank == 4 && to_rank == 5) {

            if (board[to_file + 1][5].indexOf('peonnegro') > -1) {

                if (lastMove.from == gameManager.getSquareName(to_file + 1, 7)
                    && lastMove.to == gameManager.getSquareName(to_file + 1, 5)) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;
            }


        } else if (to_rank - from_rank == -1
            && board[from_file][from_rank].indexOf('peonnegro') > -1
            && from_rank == 3 && to_rank == 2) {

            if (board[to_file + 1][4].indexOf('peonblanco') > -1) {

                if (lastMove.from == gameManager.getSquareName(to_file + 1, 2)
                    && lastMove.to == gameManager.getSquareName(to_file + 1, 4)) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;
            }

        } else {

            return false;

        }

    } else {

        return false;

    }

}

//Evaluates the case of a pawn eating en passant

gameManager.enPassant = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    let match = gameManager.ongoingGames[matchId];

    let lastMove = match[match.length - 1].lastMove;

    if (Math.abs(from_file - to_file) == 1 && gameManager.pieceColor(matchId, to) == false) {

        if (to_rank - from_rank == 1
            && gameManager.pieceColor(matchId, from) == 'white'
            && from_rank == 4 && to_rank == 5) {

            let piece = gameManager.pieceName(matchId, gameManager.getSquareName(to_file + 1, 5));

            if (piece.includes('peonnegro')) {

                if (lastMove.from == gameManager.getSquareName(to_file + 1, 7)
                    && lastMove.to == gameManager.getSquareName(to_file + 1, 5)) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;
            }


        } else if (to_rank - from_rank == -1
            && gameManager.pieceColor(matchId, from) == 'black'
            && from_rank == 3 && to_rank == 2) {

            let piece = gameManager.pieceName(matchId, gameManager.getSquareName(to_file + 1, 4));

            if (piece.includes('peonblanco')) {

                if (lastMove.from == gameManager.getSquareName(to_file + 1, 2)
                    && lastMove.to == gameManager.getSquareName(to_file + 1, 4)) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;
            }

        } else {

            return false;

        }

    } else {

        return false;

    }

}

//Evaluates the case of a pawn eating a piece

gameManager.pawnEat = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    if (Math.abs(from_file - to_file) == 1 && gameManager.pieceColor(matchId, to) !== false && gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        if (to_rank - from_rank == 1 && gameManager.pieceColor(matchId, from) == 'white') {


            return true;


        } else if (to_rank - from_rank == -1 && gameManager.pieceColor(matchId, from) == 'black') {

            return true;

        } else {

            return false;

        }

    } else {

        return false;

    }

}


//Evaluates the case of a pawn push one square to the front

gameManager.pawnPush = function (matchId, from, to) {

    let from_file = gameManager.letterToNumber(from[0]) - 1;
    let from_rank = parseInt(from[1]) - 1;

    let to_file = gameManager.letterToNumber(to[0]) - 1;
    let to_rank = parseInt(to[1]) - 1;

    if (from_file == to_file && gameManager.pieceColor(matchId, to) == false) {

        if (to_rank - from_rank == 1 && gameManager.pieceColor(matchId, from) == 'white') {


            return true;


        } else if (to_rank - from_rank == -1 && gameManager.pieceColor(matchId, from) == 'black') {

            return true;

        } else {

            return false;

        }

    } else {

        return false;

    }

}

//Evaluates if the user is trying to promote to a valid piece

gameManager.checkPromotion = function (matchId, square, promotionPiece) {

    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];
    let color = state.next;

    //console.log('the color is ' + color);
    //console.log('the square is '+ square);

    if (color == 'white' && square.includes('8')) {

        let validPieces = ['reinablanca', 'torreblanca', 'afilblanco', 'caballoblanco'];

        return validPieces.includes(promotionPiece);

    } else if (color == 'black' && square.includes('1')) {

        let validPieces = ['reinanegra', 'torrenegra', 'afilnegro', 'caballonegro'];

        return validPieces.includes(promotionPiece);

    } else {

        return false;

    }

}

//Evaluates the legallity of a pawn move

gameManager.pawnMove = function (matchId, from, to, promotion) {

    //console.log('hola promotion: '+promotion);

    if (gameManager.pawnPush(matchId, from, to) && promotion == false) {

        return true;

    } else if (gameManager.pawnJump(matchId, from, to)) {

        return true;

    } else if (gameManager.pawnEat(matchId, from, to) && promotion == false) {

        return true;

    } else if (gameManager.enPassant(matchId, from, to)) {

        return true;

    } else if (gameManager.pawnPush(matchId, from, to) && promotion || gameManager.pawnEat(matchId, from, to) && promotion) {

        //console.log('the user is trying to promote ' + promotion);

        return gameManager.checkPromotion(matchId, to, promotion);

    } else {

        return false;

    }

}

//Checks if the opposite king is checking the square

gameManager.checkForKing = function (board, square, color) {

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let f;
    let r;
    let opuesto = color == 'white' ? 'negro' : 'blanco';

    //check the top part
    if (rank < 7) {

        f = file;
        r = rank + 1;

        if (board[f][r].indexOf('rey' + opuesto) != -1) {

            return true

        }

        if (file > 0) {

            f = file - 1;

            if (board[f][r].indexOf('rey' + opuesto) != -1) {

                return true

            }

        }

        if (file < 7) {

            f = file + 1;

            if (board[f][r].indexOf('rey' + opuesto) != -1) {

                return true

            }


        }

    }

    //check the bottom part
    if (rank > 0) {

        f = file;
        r = rank - 1;

        if (board[f][r].indexOf('rey' + opuesto) != -1) {

            return true

        }

        if (file > 0) {

            f = file - 1;

            if (board[f][r].indexOf('rey' + opuesto) != -1) {

                return true

            }

        }

        if (file < 7) {

            f = file + 1;

            if (board[f][r].indexOf('rey' + opuesto) != -1) {

                return true

            }


        }

    }

    //Check right

    if (file < 7) {

        f = file + 1;
        r = rank;

        if (board[f][r].indexOf('rey' + opuesto) != -1) {

            return true

        }

    }

    //Check left

    if (file > 0) {

        f = file - 1;
        r = rank;

        if (board[f][r].indexOf('rey' + opuesto) != -1) {

            return true

        }

    }

    return false;

}

//Checks if any pawns are checking the square

gameManager.checkForPawns = function (board, square, color) {

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let f;
    let r;

    if (color == 'white') {

        if (rank < 7) {

            if (file > 0) {

                f = file - 1;
                r = rank + 1;

                if (board[f][r].indexOf('peonnegro') != -1) {

                    return true

                }

            }

            if (file < 7) {

                f = file + 1;
                r = rank + 1;

                if (board[f][r].indexOf('peonnegro') != -1) {

                    return true

                }


            }

        }

    }

    if (color == 'black') {

        if (rank > 0) {

            if (file < 7) {

                f = file + 1;
                r = rank - 1;

                if (board[f][r].indexOf('peonblanco') != -1) {

                    return true

                }

            }

            if (file > 0) {

                f = file - 1;
                r = rank - 1;

                if (board[f][r].indexOf('peonblanco') != -1) {

                    return true

                }


            }


        }

    }


    return false;

}

//Checks if any knights are checking the square

gameManager.checkForKnights = function (board, square, color) {

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let f;
    let r;
    let opuesto = color == 'white' ? 'negro' : 'blanco';

    //Left side
    if (file >= 2) {

        if (rank > 0) {

            f = file - 2;
            r = rank - 1;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

        if (rank < 7) {

            f = file - 2;
            r = rank + 1;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

    }

    //Top side
    if (rank <= 5) {

        if (file > 0) {

            f = file - 1;
            r = rank + 2;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

        if (file < 7) {

            f = file + 1;
            r = rank + 2;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

    }

    //Right side
    if (file <= 5) {

        if (rank > 0) {

            f = file + 2;
            r = rank - 1;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

        if (rank < 7) {

            f = file + 2;
            r = rank + 1;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

    }

    //Bottom side
    if (rank >= 2) {

        if (file > 0) {

            f = file - 1;
            r = rank - 2;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

        if (file < 7) {

            f = file + 1;
            r = rank - 2;

            if (board[f][r].indexOf('caballo' + opuesto) != -1) {

                return true

            }

        }

    }

    return false;

}

//Check if there is an opposite rook or queen looking at the square in a rank

gameManager.checkRank = function (board, square, color) {

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let opuesto = color == 'white' ? 'negra' : 'blanca';
    let rightSpace = 7 - file;
    let leftSpace = 7 - rightSpace;

    for (let i = 1; i <= rightSpace; i++) {

        if (board[file + i][rank] !== 'vacio') {

            if (board[file + i][rank].indexOf('reina' + opuesto) != -1 || board[file + i][rank].indexOf('torre' + opuesto) != -1) {

                return true;

            } else {


                break;

            }

        }

    }

    for (let i = 1; i <= leftSpace; i++) {

        if (board[file - i][rank] !== 'vacio') {

            if (board[file - i][rank].indexOf('reina' + opuesto) != -1 || board[file - i][rank].indexOf('torre' + opuesto) != -1) {


                return true;

            } else {

                break;

            }

        }

    }

    return false;


}

//Check if there is an opposite rook or queen looking at the square in a file

gameManager.checkFile = function (board, square, color) {

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let opuesto = color == 'white' ? 'negra' : 'blanca';
    let topSpace = 7 - rank;
    let bottomSpace = 7 - topSpace;


    for (let i = 1; i <= topSpace; i++) {

        if (board[file][rank + i] !== 'vacio') {

            if (board[file][rank + i].indexOf('reina' + opuesto) != -1 || board[file][rank + i].indexOf('torre' + opuesto) != -1) {

                return true;

            } else {


                break;

            }

        }

    }

    for (let i = 1; i <= bottomSpace; i++) {

        if (board[file][rank - i] !== 'vacio') {

            if (board[file][rank - i].indexOf('reina' + opuesto) != -1 || board[file][rank - i].indexOf('torre' + opuesto) != -1) {


                return true;

            } else {

                break;

            }

        }

    }

    return false;


}

//Checks if there is a bishop or queen watching the square from a diagonal

gameManager.checkDiagonal = function (board, square, color) {

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let opuesto = color == 'white' ? 'negr' : 'blanc';
    let topSpace = 7 - rank;
    let rightSpace = 7 - file;

    let northEast = topSpace > rightSpace ? rightSpace : topSpace;
    let southWest = rank > file ? file : rank;
    let northWest = topSpace > file ? file : topSpace;
    let southEast = rank > rightSpace ? rightSpace : rank;


    //North East Diagonal
    for (let i = 1; i <= northEast; i++) {

        if (board[file + i][rank + i] !== 'vacio') {

            if (board[file + i][rank + i].indexOf('reina' + opuesto + 'a') != -1 || board[file + i][rank + i].indexOf('afil' + opuesto + 'o') != -1) {

                return true;

            } else {

                break;

            }

        }

    }

    //South West Diagonal
    for (let i = 1; i <= southWest; i++) {

        if (board[file - i][rank - i] !== 'vacio') {

            if (board[file - i][rank - i].indexOf('reina' + opuesto + 'a') != -1 || board[file - i][rank - i].indexOf('afil' + opuesto + 'o') != -1) {

                return true;

            } else {

                break;

            }

        }

    }

    //North West Diagonal
    for (let i = 1; i <= northWest; i++) {

        if (board[file - i][rank + i] !== 'vacio') {

            if (board[file - i][rank + i].indexOf('reina' + opuesto + 'a') != -1 || board[file - i][rank + i].indexOf('afil' + opuesto + 'o') != -1) {

                return true;

            } else {

                break;

            }

        }

    }

    //South East Diagonal
    for (let i = 1; i <= southEast; i++) {

        if (board[file + i][rank - i] !== 'vacio') {

            if (board[file + i][rank - i].indexOf('reina' + opuesto + 'a') != -1 || board[file + i][rank - i].indexOf('afil' + opuesto + 'o') != -1) {

                return true;

            } else {

                break;

            }

        }

    }

    return false;

}

//Checks if a square is in check

gameManager.squareInCheck = function (board, square, color) {

    if (gameManager.checkForKnights(board, square, color)) {

        return true;

    }

    if (gameManager.checkForPawns(board, square, color)) {

        return true;

    }

    if (gameManager.checkForKing(board, square, color)) {

        return true;

    }

    if (gameManager.checkFile(board, square, color)) {

        return true;

    }

    if (gameManager.checkRank(board, square, color)) {

        return true;

    }

    if (gameManager.checkDiagonal(board, square, color)) {

        return true;

    }

    return false;

}

//Check if the squares are empty and are not being checked
gameManager.squaresAreClear = function (matchId, squares, board, color) {

    for (let i = 0; i < squares.length; i++) {

        if (gameManager.squareInCheck(board, squares[i], color) || gameManager.pieceColor(matchId, squares[i]) !== false) {

            return false;
        }

    }

    return true;


}

//Checks if the necessary squares to castle are not being attacked or occupied by other pieces
gameManager.verifyCastlePath = function (matchId, color, type, board) {

    if (color == 'white') {

        if (gameManager.squareInCheck(board, 'e1', color) == false) {

            if (type == 'short' && gameManager.squareInCheck(board, 'h1', color) == false) {

                return gameManager.squaresAreClear(matchId, ['f1', 'g1'], board, color);

            }

            if (type == 'long' && gameManager.squareInCheck(board, 'a1', color) == false) {

                return gameManager.squaresAreClear(matchId, ['d1', 'c1', 'b1'], board, color);

            }

        }

    } else if (color == 'black') {

        if (gameManager.squareInCheck(board, 'e8', color) == false) {

            if (type == 'short' && gameManager.squareInCheck(board, 'h8', color) == false) {

                return gameManager.squaresAreClear(matchId, ['f8', 'g8'], board, color)

            }

            if (type == 'long' && gameManager.squareInCheck(board, 'a8', color) == false) {

                return gameManager.squaresAreClear(matchId, ['d8', 'c8', 'b8'], board, color);

            }

        }

    }

    return false;


}

//Evaluates if the king is trying to castle and if it's valid
gameManager.castling = function (matchId, from, to) {

    let color = gameManager.pieceColor(matchId, from);
    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];

    if (color == 'white' && from == 'e1') {

        if (to == 'h1') {

            if (gameManager.verifyCastlePath(matchId, 'white', 'short', state.squares)) {

                return state.whiteShortCastle;

            }

        } else if (to == 'a1') {

            if (gameManager.verifyCastlePath(matchId, 'white', 'long', state.squares)) {

                return state.whiteLongCastle;

            }

        }

    } else if (color == 'black' && from == 'e8') {

        if (to == 'h8') {

            if (gameManager.verifyCastlePath(matchId, 'black', 'short', state.squares)) {

                return state.blackShortCastle;

            }

        } else if (to == 'a8') {

            if (gameManager.verifyCastlePath(matchId, 'black', 'long', state.squares)) {

                return state.blackLongCastle;

            }

        }

    }

    return false;

}


//Checks if the move is valid
gameManager.evaluateMove = function (data) {

    let matchId = data.roomId;
    let from = data.from;
    let to = data.to;
    let playerId = data.playerId;
    let promotion = typeof data.promotion == 'string' ? data.promotion : false;

    if (gameManager.validColor(matchId, from, to, playerId)) {

        let movedPiece = gameManager.pieceName(matchId, from);

        if (movedPiece.indexOf('peon') != -1 && gameManager.pawnMove(matchId, from, to, promotion)) {

            return gameManager.updateState(matchId, from, to, true, promotion);


        } else if (movedPiece.indexOf('caballo') != -1 && gameManager.knightMove(matchId, from, to)) {

            return gameManager.updateState(matchId, from, to, true);

        } else if (movedPiece.indexOf('torre') != -1 && gameManager.rookMove(matchId, from, to)) {

            return gameManager.updateState(matchId, from, to, true);

        } else if (movedPiece.indexOf('afil') != -1 && gameManager.bishopMove(matchId, from, to)) {

            return gameManager.updateState(matchId, from, to, true);

        } else if (movedPiece.indexOf('reina') != -1 && gameManager.queenMove(matchId, from, to)) {

            return gameManager.updateState(matchId, from, to, true);

        } else if (movedPiece.indexOf('rey') != -1 && gameManager.kingMove(matchId, from, to)) {

            return gameManager.updateState(matchId, from, to, true);

        } else if (movedPiece.indexOf('rey') != -1 && gameManager.castling(matchId, from, to)) {

            return gameManager.updateState(matchId, from, to, true);

        } else {

            return false;

        }

    } else {

        return false;

    }

}

gameManager.moveRequest = function (data) {

    //checks the existance of an ongoing match and the id of the user whose turn is next
    if (data.roomId) {

        if (gameManager.currentTurn(data.roomId) == gameManager.userColor(data.roomId, data.playerId)) {

            return gameManager.evaluateMove(data);

        } else {

            return false;

        }

    } else {

        return false;

    }

}

//Returns if a square is available for a king to move there

gameManager.isAvailable = function (board, square, color) {

    if (gameManager.squareInCheck(board, square, color)) {

        return false;

    }

    let file = gameManager.letterToNumber(square[0]);
    let rank = square[1];

    let piece = board[file - 1][rank - 1];

    if (piece.includes('blanca') || piece.includes('blanco')) {

        if (color == 'white') {

            return false;

        }

    } else if (piece.includes('negra') || piece.includes('negro')) {

        if (color == 'black') {

            return false;

        }

    }

    return true;


}

//returns true if the king has an available square

gameManager.canRunAway = function (board, kingSquare, color) {

    let file = gameManager.letterToNumber(kingSquare[0]) - 1;
    let rank = parseInt(kingSquare[1]) - 1;
    let f = file;
    let r = rank;

    let boardCopy = board.map(row => row.slice());

    boardCopy[f][r] = 'vacio';

    //check the top part
    if (rank < 7) {

        f = file;
        r = rank + 1;

        if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {


            return true;

        }

        if (file > 0) {

            f = file - 1;

            if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

                //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
                return true;

            }

        }

        if (file < 7) {

            f = file + 1;

            if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

                //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
                return true;

            }


        }

    }

    //check the bottom part
    if (rank > 0) {

        f = file;
        r = rank - 1;

        if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

            //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
            return true;

        }

        if (file > 0) {

            f = file - 1;

            if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

                //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
                return true;

            }

        }

        if (file < 7) {

            f = file + 1;

            if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

                //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
                return true;

            }


        }

    }

    //Check right

    if (file < 7) {

        f = file + 1;
        r = rank;

        if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

            //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
            return true;

        }

    }

    //Check left

    if (file > 0) {

        f = file - 1;
        r = rank;

        if (gameManager.isAvailable(boardCopy, gameManager.getSquareName(f + 1, r + 1), color)) {

            //console.log('the king can escape to ' + gameManager.getSquareName(f + 1, r + 1));
            return true;

        }

    }

    return false;

}

//Returns true if there is a stalemate

gameManager.stalemate = function (matchId) {

    let match = gameManager.ongoingGames[matchId];
    let index = match.length - 1;

    let state = match[index];
    let board = state.squares;

    let kingSquare = gameManager.getKingSquare(board, state.next);

    let opponent = state.next == 'white' ? 'black' : 'white';

    if (gameManager.squareInCheck(board, kingSquare, state.next) == false) {

        if (gameManager.canRunAway(board, kingSquare, state.next)) {

            //console.log("Square: "+kingSquare);
            //console.log('can run away');

            return false;

        } else if (gameManager.canSaveTheKing(matchId, board, kingSquare, state.next)) {

            //console.log("Square: "+kingSquare);
            //console.log('can save the king');

            return false;

        } else {

            return true;

        }


    } else {

        return false;

    }

}

gameManager.moveLimit = function (matchId) {

    let match = gameManager.ongoingGames[matchId];
    let index = match.length - 1;

    let state = match[index];

    return state.moveCount >= 50;


}

//returns true if a position is repeated 3 times in a match

gameManager.threefoldRepetition = function (matchId) {

    let match = gameManager.ongoingGames[matchId];

    let map = match[0].map;

    //console.log(Array.from(map));

    for (const [key, value] of map) {
        if (value >= 3) {
            return true;
        }
    }
    return false;

}

//Returns true if there is insufficient material to checkmate one of the kings

gameManager.insufficientMaterial = function (matchId) {

    let game = gameManager.ongoingGames[matchId];
    let state = game[game.length - 1];
    let board = state.squares;

    let blackPieces = {

        pawns: 0,
        rooks: 0,
        queens: 0,
        bishops: 0,
        knights: 0

    }

    let whitePieces = {

        pawns: 0,
        rooks: 0,
        queens: 0,
        bishops: 0,
        knights: 0

    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {

            switch (board[i][j]) {

                case 'peonnegro':

                    blackPieces.pawns++;

                    break;

                case 'peonblanco':

                    whitePieces.pawns++;

                    break;

                case 'reinanegra':

                    blackPieces.queens++;

                    break;

                case 'reinablanca':

                    whitePieces.queens++;

                    break;

                case 'torrenegra':

                    blackPieces.rooks++;

                    break;

                case 'torreblanca':

                    whitePieces.rooks++;

                    break;

                case 'afilnegro':

                    blackPieces.bishops++;

                    if ((j+i) % 2 == 0) {

                        blackPieces.blackSquareBishops++;
                        
                    } else {

                        blackPieces.whiteSquareBishops++;
                        
                    }
                

                    break;

                case 'afilblanco':

                    whitePieces.bishops++;

                    if ((j+i) % 2 == 0) {

                        whitePieces.blackSquareBishops++;
                        
                    } else {

                        whitePieces.whiteSquareBishops++;
                        
                    }

                    break;

                case 'caballonegro':

                    blackPieces.knights++;

                    break;

                case 'caballoblanco':

                    whitePieces.knights++;

                    break;

                case 'vacio':

                    break;

                case 'reynegro':

                    break;

                case 'reyblanco':

                    break;

                default:

                console.log('Found unrecongized type piece: '+board[i][j]);

            }

        }
    }

    if(blackPieces.pawns == 0 && whitePieces.pawns == 0 && 
        blackPieces.rooks == 0 && whitePieces.rooks == 0 &&
        blackPieces.queens == 0 && whitePieces.queens == 0){

        if(blackPieces.knights == 2 && whitePieces.knights + whitePieces.bishops == 0){
            //two black knights vs lone king
            return true;            

        }else if(whitePieces.knights == 2 && blackPieces.knights + blackPieces.bishops == 0){
            //two white knights vs lone king
            return true;

        }else if(blackPieces.knights + whitePieces.knights +blackPieces.bishops + whitePieces.bishops <= 1){
            //one minor piece vs lone king
            return true;

        }else if(blackPieces.knights + blackPieces.bishops == 1 && whitePieces.bishops + whitePieces.knights == 1){
            //Both sides have 1 minor piece
            return true;

        }else if(blackPieces.knights == 0 && whitePieces.knights + whitePieces.bishops <=1 &&
                (blackPieces.bishops == blackPieces.whiteSquareBishops || blackPieces.bishops == blackPieces.blackSquareBishops)){
            //white doesnt have enough pieces and black has only same color bishops

            return true;

        }else if(whitePieces.knights == 0 && blackPieces.knights + blackPieces.bishops <=1 &&
            (whitePieces.bishops == whitePieces.whiteSquareBishops || whitePieces.bishops == whitePieces.blackSquareBishops)){
            //black doesnt have enough pieces and white has only same color bishops
            return true;

        }else{

            return false;

        }

    }else{

        return false;

    }

}

//Returns the reason if there is a draw or false if there is not

gameManager.draw = function (matchId) {

    if (gameManager.stalemate(matchId)) {

        return 'Stalemate';

    } else if (gameManager.moveLimit(matchId)) {

        return '50-move limit';

    } else if (gameManager.threefoldRepetition(matchId)) {

        return 'Threefold repetition';

    } else if (gameManager.insufficientMaterial(matchId)) {

        return 'Insufficient Material';

    } else {

        return false;

    }

}

//Returns a winner if the king is in checkmate
gameManager.checkmate = function (matchId) {

    let match = gameManager.ongoingGames[matchId];
    let index = match.length - 1;

    let state = match[index];
    let board = state.squares;

    let kingSquare = gameManager.getKingSquare(board, state.next);

    let opponent = state.next == 'white' ? 'black' : 'white';

    if (gameManager.squareInCheck(board, kingSquare, state.next)) {

        if (gameManager.canRunAway(board, kingSquare, state.next)) {

            //console.log('can run away');

            return false;

        } else if (gameManager.canSaveTheKing(matchId, board, kingSquare, state.next)) {

            //console.log('can save the king');

            return false;

        } else {

            gameManager.ongoingGames[matchId][index].winner = opponent;
            return opponent;

        }


    } else {

        return false;

    }

}

//Returns an array with the location of all the pieces a color has left

gameManager.getTeamLocations = function (board, color) {

    let team = []
    let identifier = color == 'white' ? 'blanc' : 'negr';

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            if (board[i][j].includes(identifier)) {

                team.push(gameManager.getSquareName(i + 1, j + 1));

            }

        }

    }

    return team;


}

//Goes through all of the squares and checks if the piece at a given square can move there legally

gameManager.checkAllMoves = function (matchId, square) {

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            if (gameManager.evaluateSaveMove(matchId, square, gameManager.getSquareName(i + 1, j + 1))) {

                return true;

            }

        }

    }

    return false;

}

//Function called only when the king cant escape by itself
//Checks if any of the other pieces can save him by eating the attacker or covering for him

gameManager.canSaveTheKing = function (matchId, board, kingSquare, color) {

    let kingTeam = gameManager.getTeamLocations(board, color);

    if (kingTeam.length > 1) {

        for (let i = 0; i < kingTeam.length; i++) {

            let square = kingTeam[i];

            if (gameManager.checkAllMoves(matchId, square)) {

                //console.log('the piece at ' + square + 'can save the king');

                return true;

            }

        }


    }

    return false;

}

//Checks if the move to save the king is valid
gameManager.evaluateSaveMove = function (matchId, from, to) {

    let movedPiece = gameManager.pieceName(matchId, from);

    if (movedPiece.indexOf('peon') != -1 && gameManager.pawnMove(matchId, from, to, false)) {

        return gameManager.updateState(matchId, from, to, false);

    } else if (movedPiece.indexOf('caballo') != -1 && gameManager.knightMove(matchId, from, to)) {

        return gameManager.updateState(matchId, from, to, false);

    } else if (movedPiece.indexOf('torre') != -1 && gameManager.rookMove(matchId, from, to)) {

        return gameManager.updateState(matchId, from, to, false);

    } else if (movedPiece.indexOf('afil') != -1 && gameManager.bishopMove(matchId, from, to)) {

        return gameManager.updateState(matchId, from, to, false);

    } else if (movedPiece.indexOf('reina') != -1 && gameManager.queenMove(matchId, from, to)) {

        return gameManager.updateState(matchId, from, to, false);

    } else if (movedPiece.indexOf('rey') != -1 && gameManager.kingMove(matchId, from, to)) {

        return gameManager.updateState(matchId, from, to, false);

    } else {

        return false;

    }

}

gameManager.notifyEnPassant = function (matchId) {

    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];

    return state.enPassant;

}

gameManager.notifyCastling = function (matchId) {

    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];

    return state.castle;

}

gameManager.notifyPromotion = function (matchId) {

    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];

    return state.promotion;

}

gameManager.checkMutualDraw = function (matchId){

    let match = gameManager.ongoingGames[matchId];
    let state = match[match.length - 1];

    return state.drawRequests?.white == true && state.drawRequests.black == true;

}

gameManager.resignation = function (data){

    let userId = data.userId;

    let match = gameManager.ongoingGames[data.matchId];
    let state = match[match.length - 1];

    if(userId == state.blackId ){

        return 'white';


    }else if(userId == state.whiteId){

        return 'black';

    }else{

        return false;

    }

}

gameManager.drawRequest = function (data){

    let userId = data.userId;

    let match = gameManager.ongoingGames[data.matchId];
    let state = match[match.length - 1];

    if(userId == state.blackId){

        if(state.drawRequests?.black == true){

            return false;

        }else{

            state.drawRequests.black = true;

            return true;
        }

    }else if(userId == state.whiteId){

        if(state.drawRequests?.white == true){

            return false;

        }else{

            state.drawRequests.white = true;

            return true;
        }

    }else{

        return false;

    }

}

gameManager.getTimerStart = function(matchId){

    return gameManager.ongoingGames[matchId][0].timeAuthority.lastUpdate;

}

module.exports = gameManager;