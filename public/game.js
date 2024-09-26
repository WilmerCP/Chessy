let game = {

}

game.squares = []

for (let i = 0; i < 8; i++) {
    
    game.squares[i] = []
    
}

let pb = 1;
let pn = 1;

for (let i = 0; i < 8; i++) {
    
    for (let j = 0; j < 8; j++) {
    
        if(j == 1){ // Fila 2

            game.squares[i][j] = "peonblanco"+pb;
            pb++;

        }else if(j == 6){ // Fila 7

            game.squares[i][j] = "peonnegro"+pn;
            pn++;

        }else if(j == 0){ //Fila 1

            if(i == 0 || i == 7){

                game.squares[i][j] = "torreblanca";

            }

            if(i == 1 || i == 6){

                game.squares[i][j] = "caballoblanco";

            }

            if(i == 2 || i == 5){

                game.squares[i][j] = "afilblanco";

            }

            if(i == 3){

                game.squares[i][j] = "reinablanca";

            }

            if(i == 4){

                game.squares[i][j] = "reyblanco";

            }

        }else if(j == 7){ //Fila 8

            if(i == 0 || i == 7){

                game.squares[i][j] = "torrenegra";

            }

            if(i == 1 || i == 6){

                game.squares[i][j] = "caballonegro";

            }

            if(i == 2 || i == 5){

                game.squares[i][j] = "afilnegro";

            }

            if(i == 3){

                game.squares[i][j] = "reinanegra";

            }

            if(i == 4){

                game.squares[i][j] = "reynegro";

            }

        }else{

            game.squares[i][j] = "vacio";

        }
        
    }
    
}

game.jumpRightWhite = [true,true,true,true,true,true,true,true];
game.jumpRightBlack = [true,true,true,true,true,true,true,true];
game.enPassantWhite = [false,false,false,false,false,false,false,false];
game.enPassantBlack = [false,false,false,false,false,false,false,false];

game.whiteInCheck = false;
game.blackInCheck = false;
game.whiteLongCastle = true;
game.blackLongCastle = true;
game.whiteShortCastle = true;
game.blackShortCastle = true;

console.log(JSON.stringify(game,null,2));


let squares = Array.from(document.getElementsByClassName('recuadro'));

squares.forEach(square => {
    


});

let xOffSet;
let yOffSet;
game.currentSquare;
game.currentPiece;

let pieces = Array.from(document.getElementsByClassName('pieza'));

//Drag and drop logic for computers

pieces.forEach(piece =>{

    function onMouseDown(e){

        e.preventDefault();

        //Getting the offset space between the mouse and the piece position
        xOffSet = e.clientX - piece.getBoundingClientRect().left;
        yOffSet = e.clientY - piece.getBoundingClientRect().top;


        document.addEventListener('mousemove',onMouseMove);
        document.addEventListener('mouseup',onMouseUp);

        piece.style.cursor = "grabbing";
        game.currentPiece = piece;
        piece.style.zIndex = 4;
    }

    function onMouseMove(e){

        let squareX = piece.parentElement.getBoundingClientRect().left;
        let squareY = piece.parentElement.getBoundingClientRect().top;

        piece.style.left = `${e.clientX - squareX - xOffSet}px`;
        piece.style.top = `${e.clientY - squareY - yOffSet}px`;

        squares.forEach( square =>{

            let squareRect = square.getBoundingClientRect();

            if(e.clientX >= squareRect.left && 
                e.clientY >= squareRect.top && 
                e.clientX <= squareRect.right && 
                e.clientY <= squareRect.bottom ){

                    square.classList.add('encima');

                    game.currentSquare = square;

            }else{

                square.classList.remove('encima');

            }


        });


    }

    function onMouseUp(e){

        document.removeEventListener('mousemove',onMouseMove);
        document.removeEventListener('mouseup',onMouseUp);
        piece.style.cursor = "grab";

        game.currentSquare.classList.remove('encima');

        let move = {

            from: game.currentPiece.parentElement.classList[0],
            to: game.currentSquare.classList[0]

        }

        piece.style.zIndex = 3;
        game.makeMove(move);

    }

    piece.addEventListener('mousedown',onMouseDown);

});

//Drag and drop logic for mobile

pieces.forEach(piece =>{

    function onTouchStart(e){

        e.preventDefault();

        //Getting the offset space between the mouse and the piece position
        xOffSet = e.touches[0].clientX - piece.getBoundingClientRect().left;
        yOffSet = e.touches[0].clientY - piece.getBoundingClientRect().top;


        document.addEventListener('touchmove',onTouchMove);
        document.addEventListener('touchend',onTouchEnd);

        piece.style.width = "100px";
        game.currentPiece = piece;
        piece.style.zIndex = 4;

    }

    function onTouchMove(e){

        let squareX = piece.parentElement.getBoundingClientRect().left;
        let squareY = piece.parentElement.getBoundingClientRect().top;

        piece.style.left = `${e.touches[0].clientX - squareX - 70}px`;
        piece.style.top = `${e.touches[0].clientY - squareY - 70}px`;

        squares.forEach( square =>{

            let squareRect = square.getBoundingClientRect();

            if(e.touches[0].clientX >= squareRect.left && 
                e.touches[0].clientY >= squareRect.top && 
                e.touches[0].clientX <= squareRect.right && 
                e.touches[0].clientY <= squareRect.bottom ){

                    square.classList.add('encima');

                    game.currentSquare = square;

            }else{

                square.classList.remove('encima');

            }


        });

    }

    function onTouchEnd(e){

        document.removeEventListener('touchmove',onTouchMove);
        document.removeEventListener('touchend',onTouchEnd);

        piece.style.width = "100%";

        game.currentSquare.classList.remove('encima');

        let move = {

            from: game.currentPiece.parentElement.classList[0],
            to: game.currentSquare.classList[0]

        }

        piece.style.zIndex = 3;
        game.makeMove(move);

    }

    piece.addEventListener('touchstart',onTouchStart);

});


game.makeMove = function(move){

    let newSquare = document.getElementsByClassName(move.to)[0];

    newSquare.appendChild(game.currentPiece);

    game.currentPiece.style.top = '0px';
    game.currentPiece.style.bottom = '0px';
    game.currentPiece.style.left = '0px';
    game.currentPiece.style.right = '0px';

}