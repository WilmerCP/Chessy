let game = {}

game.started = false;

let logo = document.getElementById('apptitle');
logo.style.cursor = "pointer";

logo.addEventListener('click',(e)=>{

    window.location.href = '/';

});


game.socket = io('/');

let username = localStorage.getItem('username');

if (typeof (username) == 'string') {

    document.getElementById('user_name').innerHTML = username;

    game.socket.emit('findgame', { 'name': username })

}

game.socket.on('startGame', (data) => {

    game.started = true;

    document.getElementById('opponent_name').innerHTML = data.opponent;

    if (data.color == 'black') {

        document.getElementById('tablero_blancas').classList.add('hide');
        document.getElementById('tablero_negras').classList.remove('hide');

    }

    game.color = data.color;

    game.activateBoard();

});

let squares = Array.from(document.getElementsByClassName('recuadro'));

squares.forEach(square => {



});

let xOffSet;
let yOffSet;
game.currentSquare;
game.currentPiece;

let pieces = Array.from(document.getElementsByClassName('pieza'));

game.activateBoard = function () {

    //Drag and drop logic for computers

    pieces.forEach(piece => {

        function onMouseDown(e) {

            e.preventDefault();

            //Getting the offset space between the mouse and the piece position
            xOffSet = e.clientX - piece.getBoundingClientRect().left;
            yOffSet = e.clientY - piece.getBoundingClientRect().top;


            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            piece.style.cursor = "grabbing";
            game.currentPiece = piece;
            piece.style.zIndex = 4;
        }

        function onMouseMove(e) {

            let squareX = piece.parentElement.getBoundingClientRect().left;
            let squareY = piece.parentElement.getBoundingClientRect().top;

            piece.style.left = `${e.clientX - squareX - xOffSet}px`;
            piece.style.top = `${e.clientY - squareY - yOffSet}px`;

            squares.forEach(square => {

                let squareRect = square.getBoundingClientRect();

                if (e.clientX >= squareRect.left &&
                    e.clientY >= squareRect.top &&
                    e.clientX <= squareRect.right &&
                    e.clientY <= squareRect.bottom) {

                    square.classList.add('encima');

                    game.currentSquare = square;

                } else {

                    square.classList.remove('encima');

                }


            });


        }

        function onMouseUp(e) {

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            piece.style.cursor = "grab";

            game.currentSquare.classList.remove('encima');

            let move = {

                from: game.currentPiece.parentElement.classList[0],
                to: game.currentSquare.classList[0]

            }

            piece.style.zIndex = 3;
            game.resetPiece(piece);

            if (move.to !== move.from) {

                game.validateMove(move);

            }

        }

        piece.addEventListener('mousedown', onMouseDown);

    });

    //Drag and drop logic for mobile

    pieces.forEach(piece => {

        function onTouchStart(e) {

            e.preventDefault();

            //Getting the offset space between the mouse and the piece position
            xOffSet = e.touches[0].clientX - piece.getBoundingClientRect().left;
            yOffSet = e.touches[0].clientY - piece.getBoundingClientRect().top;


            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);

            piece.style.width = "100px";
            game.currentPiece = piece;
            piece.style.zIndex = 4;

        }

        function onTouchMove(e) {

            let squareX = piece.parentElement.getBoundingClientRect().left;
            let squareY = piece.parentElement.getBoundingClientRect().top;

            piece.style.left = `${e.touches[0].clientX - squareX - 70}px`;
            piece.style.top = `${e.touches[0].clientY - squareY - 70}px`;

            squares.forEach(square => {

                let squareRect = square.getBoundingClientRect();

                if (e.touches[0].clientX >= squareRect.left &&
                    e.touches[0].clientY >= squareRect.top &&
                    e.touches[0].clientX <= squareRect.right &&
                    e.touches[0].clientY <= squareRect.bottom) {

                    square.classList.add('encima');

                    game.currentSquare = square;

                } else {

                    square.classList.remove('encima');

                }


            });

        }

        function onTouchEnd(e) {

            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);

            piece.style.width = "100%";

            game.currentSquare.classList.remove('encima');

            let move = {

                from: game.currentPiece.parentElement.classList[0],
                to: game.currentSquare.classList[0]

            }

            piece.style.zIndex = 3;
            game.resetPiece(piece);

            if (move.to !== move.from) {

                game.validateMove(move);

            }

        }

        piece.addEventListener('touchstart', onTouchStart);

    });

}


game.makeMove = function (move) {

    let newSquare = document.getElementsByClassName(move.to)[0];

    if (newSquare.childElementCount > 0) {
        
        let target = newSquare.children[0];
        newSquare.removeChild(target);
    }

    let piece = document.getElementsByClassName(move.from)[0].firstChild;

    newSquare.appendChild(piece);

    piece.style.top = '0px';
    piece.style.bottom = '0px';
    piece.style.left = '0px';
    piece.style.right = '0px';

    let otherSquare = document.getElementsByClassName(move.to)[1];

    if (otherSquare.childElementCount > 0) {
        
        let target = otherSquare.children[0];
        otherSquare.removeChild(target);
    }

    let otherPiece = document.getElementsByClassName(move.from)[1].firstChild;

    otherSquare.appendChild(otherPiece);

    otherPiece.style.top = '0px';
    otherPiece.style.bottom = '0px';
    otherPiece.style.left = '0px';
    otherPiece.style.right = '0px';

}

game.resetPiece = function (piece) {

    piece.style.top = '0px';
    piece.style.bottom = '0px';
    piece.style.left = '0px';
    piece.style.right = '0px';

}

game.validateMove = function (move) {

    game.socket.emit('move', move);

}

game.socket.on('moveAccepted', (move) => {

    game.makeMove(move);

});

game.socket.on('enPassant', (details)=>{

    let square = document.getElementsByClassName(details.square)[0];

    if (square.childElementCount > 0) {
        
        let target = square.children[0];
        square.removeChild(target);
    }

    let otherSquare = document.getElementsByClassName(details.square)[1];

    if (otherSquare.childElementCount > 0) {
        
        let target = otherSquare.children[0];
        otherSquare.removeChild(target);
    }


});

game.socket.on('gameover', (details) => {

    let popup = document.getElementById('overlay');
    popup.style.display = 'flex';

    let closeButton = document.getElementById('close');
    let newMatchButton = document.getElementById('newmatch');

    closeButton.addEventListener('click',(e)=>{

        popup.style.display = 'none';

    });

    newMatchButton.addEventListener('click',(e)=>{

        location.reload();

    });

    let title = document.getElementById('wintitle');

    if(details.winner == game.color){

        title.innerHTML = 'You win!';

    }else{

        title.innerHTML = 'You lose!';

    }

    let reason = document.getElementById('winreason');

    if(details.reason == 'checkmate'){

        reason.innerHTML = 'By checkmate';

    }

    game.deactivateBoard();

});

game.deactivateBoard = function(){

    pieces.forEach(piece => {

        const newPiece = piece.cloneNode(true); // Clone without event listeners
        piece.parentNode.replaceChild(newPiece, piece);

    });


}