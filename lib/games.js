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

gameManager.evaluateMove = function (move) {

    return true;

}

gameManager.moveRequest = function (data) {

    if (data.roomId) {

        let game = gameManager.ongoingGames[data.roomId];

        if (game[0].next == 'white' && game[0].whiteId == data.playerId) {

            return gameManager.evaluateMove(data);

        } else if (game[0].next == 'black' && game[0].blackId == data.playerId) {

            return gameManager.evaluateMove(data);

        } else {

            return false;

        }

    } else {

        return false;

    }

}

module.exports = gameManager;