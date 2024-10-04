//file to handle all games logic

let gameManager = {}

gameManager.ongoingGames = {}

gameManager.initGame = function (gameid, whiteId, blackId) {

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

            if (j == 1) { // Fila 2

                game.squares[i][j] = "peonblanco" + pb;
                pb++;

            } else if (j == 6) { // Fila 7

                game.squares[i][j] = "peonnegro" + pn;
                pn++;

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
    game.enPassantWhite = [false, false, false, false, false, false, false, false];
    game.enPassantBlack = [false, false, false, false, false, false, false, false];

    game.whiteInCheck = false;
    game.blackInCheck = false;
    game.whiteLongCastle = true;
    game.blackLongCastle = true;
    game.whiteShortCastle = true;
    game.blackShortCastle = true;

    game.next = 'white';

    game.whiteId = whiteId;
    game.blackId = blackId;

    gameManager.ongoingGames[gameid] = [];

    gameManager.ongoingGames[gameid].push(game);

    console.log('New match created: ' + gameid);

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

//Updates the state of the game

gameManager.updateState = function (matchId, from, to) {

    let file1 = gameManager.letterToNumber(from[0]) - 1;
    let rank1 = from[1] - 1;

    let file2 = gameManager.letterToNumber(to[0]) - 1;
    let rank2 = to[1] - 1;

    let match = gameManager.ongoingGames[matchId];
    let index = match.length - 1;

    let state = match[index];

    let copy = JSON.parse(JSON.stringify(state));

    let piece = gameManager.pieceName(matchId, from);

    copy.squares[file1][rank1] = 'vacio';
    copy.squares[file2][rank2] = piece;

    if (copy.next == 'black') {

        copy.next = 'white';

    } else {

        copy.next = 'black';

    }

    if (piece.indexOf('peonblanco') > -1) {

        let pn = parseInt(piece[piece.length - 1]);

        copy.jumpRightWhite[pn - 1] = false;

    }

    if (piece.indexOf('peonnegro') > -1) {

        let pn = parseInt(piece[piece.length - 1]);

        copy.jumpRightBlack[pn - 1] = false;

    }

    gameManager.ongoingGames[matchId].push(copy);
    //console.log(copy.squares);


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

    if (Math.abs(to_file - from_file) <= 1 && Math.abs(to_rank - from_rank) <= 1 && gameManager.pieceColor(matchId, to) !== gameManager.pieceColor(matchId, from)) {

        return !gameManager.squareInCheck(matchId, to);

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


            return jumpRights[from_file];


        } else if (to_rank - from_rank == -2 && pieceColor == 'black') {

            return jumpRights[from_file];

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

//Evaluates the legallity of a pawn move

gameManager.pawnMove = function (matchId, from, to) {

    if (gameManager.pawnPush(matchId, from, to)) {

        return true;

    } else if (gameManager.pawnJump(matchId, from, to)) {

        return true;

    } else if (gameManager.pawnEat(matchId, from, to)) {

        return true;

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

gameManager.checkRank = function(board,square,color){

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let opuesto = color == 'white' ? 'negra' : 'blanca';
    let rightSpace = 7 - file;
    let leftSpace = 7 - rightSpace;

    console.log('square: '+square);
    console.log('right space: '+rightSpace);
    console.log('left space: '+leftSpace);

    for (let i = 1; i <= rightSpace; i++) {

        if(board[file+i][rank] !== 'vacio'){

            if(board[file+i][rank].indexOf('reina' + opuesto) != -1 || board[file+i][rank].indexOf('torre' + opuesto) != -1){

                return true;
    
            }else{


                break;

            }

        }
        
    }

    for (let i = 1; i <= leftSpace; i++) {

        if(board[file-i][rank] !== 'vacio'){

            if(board[file-i][rank].indexOf('reina' + opuesto) != -1 || board[file-i][rank].indexOf('torre' + opuesto) != -1){


                return true;
    
            }else{

                break;

            }

        }
        
    }

    return false;


}

//Check if there is an opposite rook or queen looking at the square in a file

gameManager.checkFile = function(board,square,color){

    let file = gameManager.letterToNumber(square[0]) - 1;
    let rank = parseInt(square[1]) - 1;
    let opuesto = color == 'white' ? 'negra' : 'blanca';
    let topSpace = 7 - rank;
    let bottomSpace = 7 - topSpace;

    console.log('square: '+square);
    console.log('top space: '+topSpace);
    console.log('bottom space: '+bottomSpace);

    for (let i = 1; i <= topSpace; i++) {

        if(board[file][rank+i] !== 'vacio'){

            if(board[file][rank+i].indexOf('reina' + opuesto) != -1 || board[file][rank+i].indexOf('torre' + opuesto) != -1){

                return true;
    
            }else{


                break;

            }

        }
        
    }

    for (let i = 1; i <= bottomSpace; i++) {

        if(board[file][rank-i] !== 'vacio'){

            if(board[file][rank-i].indexOf('reina' + opuesto) != -1 || board[file][rank-i].indexOf('torre' + opuesto) != -1){


                return true;
    
            }else{

                break;

            }

        }
        
    }

    return false;


}

//Checks if a square is in check

gameManager.squareInCheck = function (matchId, square) {

    let game = gameManager.ongoingGames[matchId];
    let board = game[game.length - 1].squares;
    let color = game[game.length - 1].next;

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

    return false;

}


//Checks if the move is valid
gameManager.evaluateMove = function (data) {

    let matchId = data.roomId;
    let from = data.from;
    let to = data.to;
    let playerId = data.playerId;

    if (gameManager.validColor(matchId, from, to, playerId)) {

        let movedPiece = gameManager.pieceName(matchId, from);

        if (movedPiece.indexOf('peon') != -1 && gameManager.pawnMove(matchId, from, to)) {

            gameManager.updateState(matchId, from, to);
            return true;

        } else if (movedPiece.indexOf('caballo') != -1 && gameManager.knightMove(matchId, from, to)) {

            gameManager.updateState(matchId, from, to);
            return true;

        } else if (movedPiece.indexOf('torre') != -1 && gameManager.rookMove(matchId, from, to)) {

            gameManager.updateState(matchId, from, to);
            return true;

        } else if (movedPiece.indexOf('afil') != -1 && gameManager.bishopMove(matchId, from, to)) {

            gameManager.updateState(matchId, from, to);
            return true;

        } else if (movedPiece.indexOf('reina') != -1 && gameManager.queenMove(matchId, from, to)) {

            gameManager.updateState(matchId, from, to);
            return true;

        } else if (movedPiece.indexOf('rey') != -1 && gameManager.kingMove(matchId, from, to)) {

            gameManager.updateState(matchId, from, to);
            return true;

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

        let game = gameManager.ongoingGames[data.roomId];

        if (gameManager.currentTurn(data.roomId) == gameManager.userColor(data.roomId, data.playerId)) {

            return gameManager.evaluateMove(data);

        } else {

            return false;

        }

    } else {

        return false;

    }

}

module.exports = gameManager;