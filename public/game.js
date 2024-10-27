let game = {}

game.started = false;

let logo = document.getElementById('apptitle');
logo.style.cursor = "pointer";

game.promotionWhite = document.getElementById('promotionWhite');
game.promotionBlack = document.getElementById('promotionBlack');

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

    let piece = document.getElementsByClassName(move.from)[0].firstElementChild;

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

    let otherPiece = document.getElementsByClassName(move.from)[1].firstElementChild;

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

    let pieceName = game.currentPiece.classList[1];
    let square = game.currentSquare;
    let squareName = square.classList[0];

    if(pieceName.includes('peonblanco') && squareName.includes('8') && game.color == 'white'){

        const targetPosition = square.getBoundingClientRect();
        game.promotionWhite.style.display = 'block';
        const popup = game.promotionWhite.firstElementChild;
        popup.style.top = `${targetPosition.top}px`;
        popup.style.left = `${targetPosition.left}px`;

        let promotionClickHandler = function(e){

            e.target.style.display = 'none';
            game.promotionWhite.removeEventListener('click',promotionClickHandler);
    
        }

        game.promotionWhite.addEventListener('click',promotionClickHandler);

        Array.from(popup.children).forEach(child => {

            let promotionSelectHandler = function(e){

                e.stopPropagation();

                let name = child.classList[0];
                move.promotion = name;
                game.socket.emit('move', move);

                e.target.parentElement.parentElement.style.display = 'none';
    
                e.target.removeEventListener('click',promotionSelectHandler);
    
            }
            
            child.addEventListener('click',promotionSelectHandler);

        });

    }else if(pieceName.includes('peonnegro') && squareName.includes('1') && game.color == 'black'){

        const targetPosition = square.getBoundingClientRect();
        game.promotionBlack.style.display = 'block';
        const popup = game.promotionBlack.firstElementChild;
        popup.style.top = `${targetPosition.top}px`;
        popup.style.left = `${targetPosition.left}px`;

        let promotionClickHandler = function(e){

            e.target.style.display = 'none';
            game.promotionBlack.removeEventListener('click',promotionClickHandler);
    
        }

        game.promotionBlack.addEventListener('click',promotionClickHandler);

        Array.from(popup.children).forEach(child => {

            let promotionSelectHandler = function(e){

                e.stopPropagation();

                let name = child.classList[0];
                move.promotion = name;

                console.log(move);

                game.socket.emit('move', move);

                e.target.parentElement.parentElement.style.display = 'none';
    
                e.target.removeEventListener('click',promotionSelectHandler);
    
            }
            
            child.addEventListener('click',promotionSelectHandler);

        });

    }else{

        game.socket.emit('move', move);

    }

}

game.socket.on('moveAccepted', (move) => {

    console.log('move accepted');
    console.log(move);

    game.makeMove(move);

});

game.getImgName = function(piece){

    let text = "public/img/"

    if(piece.includes('negr')){

        text = text + 'b';

    }else{

        text = text + 'w';

    }

    if(piece.includes('afil')){

        text = text + 'B';

    }

    if(piece.includes('reina')){

        text = text + 'Q';

    }

    if(piece.includes('torre')){

        text = text + 'R';

    }

    if(piece.includes('caballo')){

        text = text + 'N';

    }

    text = text + '.svg';

    return text;

}

game.socket.on('promotion', (details) => {

    let square = document.getElementsByClassName(details.square)[0];
    if (square.childElementCount > 0) {
        
        let target = square.children[0];
        target.className = 'pieza '+details.piece;
        target.src = game.getImgName(details.piece);
        game.currentSquare = false;
    }

    let otherSquare = document.getElementsByClassName(details.square)[1];
    if (otherSquare.childElementCount > 0) {
        
        let target = otherSquare.children[0];
        target.className = 'pieza '+details.piece;
        target.src = game.getImgName(details.piece);
        game.currentPiece = false;
    }

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

game.socket.on('castle', (details)=>{

    if(details.square == 'h1'){
        //white short castle

        game.makeMove({from: 'e1', to: 'g1'});
        game.makeMove({from: 'h1', to: 'f1'});

    }

    if(details.square == 'a1'){
        //white long castle
        
        game.makeMove({from: 'e1', to: 'c1'});
        game.makeMove({from: 'a1', to: 'd1'});

    }

    if(details.square == 'h8'){
        //black short castle

        game.makeMove({from: 'e8', to: 'g8'});
        game.makeMove({from: 'h8', to: 'f8'});

    }

    if(details.square == 'a8'){
        //white long castle
        
        game.makeMove({from: 'e8', to: 'c8'});
        game.makeMove({from: 'a8', to: 'd8'});

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