/**
 * GameManager.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.1.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {
    "use strict";
    var injectList = ['$rootScope', '$log', 'GameData', 'AIService', 'GameModel', 'GameBoardModel', 'PlayerModel', 'enums', 'conf'];
    /**
     * @memberof maxit.game
     * @ngdoc service
     * @name GameManager
     * @param $rootScope
     * @param $log
     * @param GameData
     * @param AIService
     * @param GameModel
     * @param GameBoardModel
     * @param PlayerModel
     * @param enums
     * @param conf
     * @constructor
     */
    var GameManager = function ($rootScope, $log, GameData, AIService, GameModel, GameBoardModel, PlayerModel, enums, conf) {

        var game = undefined;
        var copyTiles = [];
        var players = [];
        var moveLog = [];
        var currentGameCount=1;
        var turnPerKeyboard= true;

        var gameMode =  GameData.getGameMode();
        var kiTypes = [];
        var countGames = 1;
        var fieldSize =  GameData.getFieldSize();
        var quadrFieldSize = fieldSize * fieldSize;

        var startDirection = enums.directions.HORIZONTAL;

        var currentPosition = {x: 0, y: 0};
        var currentDirection = startDirection;
        var currentTurn=1;

        var gameOver = false;
        var self = this;

        this.countWinning1 = 0;
        this.countWinning2 = 0;
        this.countBoth = 0;


        // public Functions

        this.getGame = function(){
            return game.getUIGameData();
        };

        this.getPlayerScore = function (playerID){
          return players[playerID].getScore();
        };

        this.isGameOver = function(){
            return gameOver;
        };

        // only for KI vs KI
        this.resetScores = function(){
            this.countWinning1 = 0;
            this.countWinning2 = 0;
            this.countBoth = 0;
        };

        // onClick Ereignis
        function jumpToPosition (index){
            turnPerKeyboard = false;
            var oldPosition = currentPosition;
            currentPosition = game.getBoard()._positionToCoordinates(index);
            game.getBoard().changePosition(oldPosition, currentPosition);
            $rootScope.$broadcast('position:changed', currentPosition);
        }

        // moveCursor to new position
        function moveCursor(key) {
            turnPerKeyboard = true;
            var oldPosition = currentPosition;
            var tmpPosition = currentPosition;
            var ok = false;

            do{
                tmpPosition = game.getBoard().getNextPosition(currentPosition, key, currentDirection);
                if (tmpPosition == null) {
                    currentPosition = oldPosition;
                    ok = true;
                }else{
                    var cell = game.getBoard()._getCellAt(tmpPosition);
                    if (cell.deleted===true){
                        currentPosition=tmpPosition;
                    }else{
                        ok = true;
                        currentPosition=tmpPosition;
                        game.getBoard().changePosition(oldPosition, currentPosition);
                        $rootScope.$broadcast('position:changed', currentPosition);
                    }
                }

            }while (ok==false);

        }

        // Player takes a Number
        function takeaNumber() {

            var cell = game.getBoard()._getCellAt(currentPosition);

            // Nochmal nicht nehmen
            if (cell.deleted==true){
                return;
            }

            var score = cell.getScore();
            game.getBoard().removeTile(currentPosition);

            // Die Zahl wird genommen

            if (currentDirection==enums.directions.HORIZONTAL){

                players[enums.directions.HORIZONTAL].incScore(score);
                currentDirection = enums.directions.VERTICAL;

                game.getBoard().clearAvailableTiles();
                if (!game.getBoard().findAvailableTiles(currentDirection, currentPosition)){
                    gameOver = true;
                }

                $rootScope.$broadcast('player1:end', {
                    updateui: turnPerKeyboard
                });
            }else{
                players[enums.directions.VERTICAL].incScore(score);
                currentDirection = enums.directions.HORIZONTAL;

                game.getBoard().clearAvailableTiles();
                if (!game.getBoard().findAvailableTiles(currentDirection, currentPosition)){
                    gameOver = true;
                }
                $rootScope.$broadcast('player2:end', {
                    updateui: turnPerKeyboard
                });
            }

        }

        // KI Movement
        function play(){

            if (gameOver==true){
                return;
            }

            // Bewertung des Zuges
            var diff = getPlayerDifference();
            $log.log("Startbewertung : ", diff);


            var pushFactor = (currentTurn > (quadrFieldSize/2) );
            currentTurn=currentTurn+2;

            var ki = getCurrentKitype();
            var gameBoard = game.getBoard();
            var move = AIService.getBestMove(gameBoard, currentDirection, currentPosition, ki, diff, pushFactor);

            // Zug + Score des Feldes
            if (move.bestMove!== undefined){

                var maxTile = gameBoard.getTile(move.bestMove);
                var score = maxTile.getScore();

                moveLog.push({
                    player: currentDirection,
                    kiType: ki,
                    score: score,
                    index: move.bestMove
                });

                $log.log("Computer nimmt die : ", score);

                // Erhöhen des Scores
                players[currentDirection].incScore(score);
                $log.log("Player ", currentDirection, " neue Punkte: ", players[currentDirection].getPlayerData());

                // Grafisches Ziehen auf dem Feld
                var oldPosition = currentPosition;
                currentPosition = {x: maxTile.x, y:maxTile.y};

                gameBoard.changePosition(oldPosition, currentPosition);
                gameBoard.clearAvailableTiles();
                gameBoard.removeTile(currentPosition);

                switchPlayer();

                if (!gameBoard.findAvailableTiles(currentDirection, currentPosition)){
                    gameOver = true;
                }
                $rootScope.$broadcast('ki:endTurn', null);

            }else{
                gameOver=true;
            }



        }

        // Playet Switch
        function switchPlayer(){
            if (currentDirection === enums.directions.HORIZONTAL){
                currentDirection = enums.directions.VERTICAL;
            }else{
                currentDirection = enums.directions.HORIZONTAL;
            }
        }

        //Check Key ENTER or Arrows
        function decideMovement (key){

            if (key === enums.keys.ENTER) {
                takeaNumber();
            } else if (key === enums.keys.SPACE){

            } else{
                moveCursor(key);
            }
        }

        // Check Click in Field
        function decideClickMovement (index){
            if (game.getBoard().isTilePossibleTurn(index)== true){
                $log.log("Zug in Ordnung", index);
                jumpToPosition(index);
                takeaNumber();
            }

        }

        // Difference of Scores
        function getPlayerDifference(){
            var val1 =  players[enums.directions.HORIZONTAL].getScore();
            var val2 =  players[enums.directions.VERTICAL].getScore();
            if (currentDirection == enums.directions.VERTICAL){
                return (val2-val1);
            }else{
                return (val1-val2);
            }
        }

        // KI Type
        function getCurrentKitype(){
            return kiTypes[currentDirection];
        }

        // Counting Games - only KI vs KI
        function setWinnerVars(){
            var sc1 = self.getPlayerScore(1);
            var sc2 = self.getPlayerScore(2);

            if (sc1 > sc2){
                self.countWinning1 += 1;
                $log.debug("C1 hat gewonnen");
            }else{
                if (sc2 > sc1) {
                    self.countWinning2 += 1;
                    $log.debug("C2 hat gewonnen");
                }else{
                    self.countBoth += 1;
                    $log.debug("Unentschieden");
                }
            }


        }

        // Only KI vs KI
        function startKITestGames(){

            for (var j=1; j<=countGames; j++) {
                currentGameCount = j;
                $log.debug("Spiel Nr: ", currentGameCount);

                // Wechseln wer anfängt und neues Spiel generieren
                if (j > 1) {
                    if (currentDirection == enums.directions.HORIZONTAL) {
                        $log.debug("VERTICAL fängt an");
                        initTestGame(enums.directions.VERTICAL);
                    } else {
                        $log.debug("HORIZONTAL fängt an");
                        initTestGame(enums.directions.HORIZONTAL);
                    }
                }else{
                    $log.debug("HORIZONTAL fängt an");
                }

                //Spielen bis GameOver
                while (gameOver==false){
                    play();
                }

                setWinnerVars();
                $log.log("Move-Log: ", moveLog);
                $rootScope.$broadcast('ki:GameEnded', null);
            }

            $log.debug("Spiele beendet.");
            $log.debug("C1: ", self.countWinning1);
            $log.debug("C2: ", self.countWinning2);
            $log.debug("Unentschieden: ", self.countBoth);

            $rootScope.$broadcast('ki:AllGamesEnded', null);
        }

        // Only PLAYER VS KI / PLAYEr VS Player
        this.continueGame = function (){

            if (gameOver == true){
                return;
            }
            if (gameMode == enums.gameMode.PLAYERVSKI){
                // KI
                if (currentDirection === enums.directions.VERTICAL){
                    play();
                }
            }
        };

        // Only PLAYER VS KI / PLAYEr VS Player
        this.move = function (key) {

            if (gameOver == true){
                return;
            }

            switch (gameMode){

                case enums.gameMode.PLAYERVSPLAYER:
                    decideMovement(key);
                    break;

                case enums.gameMode.PLAYERVSKI:
                    // PLAYER
                    if (enums.directions.HORIZONTAL){
                        decideMovement(key);
                    }
                    break;
            }
        };

        // Click on Tile
        this.clickedOnTile = function (index){

            if (gameOver == true){
                return;
            }

            switch (gameMode){
                case enums.gameMode.PLAYERVSPLAYER:
                    decideClickMovement(index);
                    break;

                case enums.gameMode.PLAYERVSKI:
                    // PLAYER
                    if (enums.directions.HORIZONTAL){
                        decideClickMovement(index);
                    }
                    break;
            }
        };


        //Inizializes new Games
        // ------------------------------------
        function initGame(direction){

            moveLog = [];
            turnPerKeyboard= true;

            switch (gameMode){
                case (enums.gameMode.PLAYERVSKI):
                    players[enums.directions.HORIZONTAL] = new PlayerModel(enums.directions.HORIZONTAL, enums.playerType.HUMAN);
                    players[enums.directions.VERTICAL] = new PlayerModel(enums.directions.VERTICAL, enums.playerType.KI);
                    break;
                case (enums.gameMode.PLAYERVSPLAYER):
                    players[enums.directions.HORIZONTAL] = new PlayerModel(enums.directions.HORIZONTAL, enums.playerType.HUMAN);
                    players[enums.directions.VERTICAL] = new PlayerModel(enums.directions.VERTICAL, enums.playerType.HUMAN);
                    break;
                default:
                    players[enums.directions.HORIZONTAL] = new PlayerModel(enums.directions.HORIZONTAL, enums.playerType.HUMAN);
                    players[enums.directions.VERTICAL] = new PlayerModel(enums.directions.VERTICAL, enums.playerType.KI);
                    break;
            }
            $log.info("PLAYER1: ", players[enums.directions.HORIZONTAL].getPlayerData());
            $log.info("PLAYER2: ", players[enums.directions.VERTICAL].getPlayerData());


            // STARTVARS
            gameOver = false;
            currentTurn = 1;
            currentDirection = direction || startDirection;

            var oldPosition = currentPosition;
            currentPosition = {
                x:0,
                y:(GameData.getFieldSize() - 1)
            };

            // Die Startumrandung explizit setzen, damit die class-Variablen für das css gesetzt sind
            if (game){
                game.getBoard().changePosition(oldPosition, currentPosition);
                $rootScope.$broadcast('position:changed', currentPosition);
            }

            // GAMEBOARD -----------------------------
            var board = new GameBoardModel();
            board.resetConfig(GameData.getFieldSize());
            board.buildEmptyBoard ();

            if (conf.kiTest===true){
                board.buildDefinedFields();
            }else{
                board.buildRandomFields();
            }

            // Grafische Sachen
            board.findAvailableTiles(currentDirection, currentPosition);
            board.findPosition(currentPosition);
            // ---------------------------------------

            game = new GameModel(board);
            $log.log ("GameBoard:",angular.copy(game.getUIGameData()));
        }

        // nur KI vs KI
        function initTestGame(direction){

            players[enums.directions.HORIZONTAL] = new PlayerModel(enums.directions.HORIZONTAL, enums.playerType.KI);
            players[enums.directions.VERTICAL] = new PlayerModel(enums.directions.VERTICAL, enums.playerType.KI);
            $log.info("PLAYER1: ", players[enums.directions.HORIZONTAL].getPlayerData());
            $log.info("PLAYER2: ", players[enums.directions.VERTICAL].getPlayerData());


            // STARTVARS
            gameOver = false;
            currentTurn = 1;
            currentDirection = direction || startDirection;
            currentPosition = {
                x:0,
                y:(GameData.getFieldSize() - 1)
            };


            var boardModCounter = currentGameCount%2;

            // GAMEBOARD -----------------------------

            var board = new GameBoardModel();
            board.resetConfig(GameData.getFieldSize());
            board.buildEmptyBoard ();

            // -------- Alle zwei Spiele ein neues Board
            if (boardModCounter==0){
                board.restoreTiles(copyTiles);
            }else{
                if (conf.kiTest===true){
                    board.buildDefinedFields();
                }else{
                    board.buildRandomFields();
                }
                copyTiles  = board.backUpTiles();
            }
            //Sicherungskopie des Feldes. Wichtig für den zweiten Durchlauf!
            game = new GameModel(board);
            $log.info ("copyTiles: ", copyTiles);
            $log.log ("GameBoard(:", currentGameCount, "), ", (angular.copy(game.getBoard().getBoardTiles())));
            // ----------------------------------------
        }

        function createNewGame (){

            fieldSize = GameData.getFieldSize();
            quadrFieldSize = fieldSize * fieldSize;
            gameMode = GameData.getGameMode();

            // Erstes Spiel
            currentGameCount = 1;
            // Erster Zug
            currentTurn=1;


            $log.debug("Startvars");
            $log.debug("kiType HORIZONTAL:" , kiTypes[enums.directions.HORIZONTAL]);
            $log.debug("kiType VERTICAL: " , kiTypes[enums.directions.VERTICAL]);

            $log.debug("FieldSize:" , fieldSize);
            $log.debug("Anzahl Felder:" , quadrFieldSize);
            $log.debug("GameMode" , gameMode);
            $log.debug("Counter:" , countGames);
            $log.debug("ZugCounter:" , currentTurn);

        }

        this.newTestGame = function(selectedLengthList){
            kiTypes[enums.directions.HORIZONTAL] = GameData.getKIType(enums.directions.HORIZONTAL);
            kiTypes[enums.directions.VERTICAL] = GameData.getKIType(enums.directions.VERTICAL);
            countGames = selectedLengthList;

            self.resetScores();
            createNewGame();
            initTestGame();
        };

        this.newGame = function (){
            kiTypes[enums.directions.HORIZONTAL] = undefined;
            kiTypes[enums.directions.VERTICAL] = GameData.getKIType(enums.directions.VERTICAL);
            countGames = 1;

            createNewGame();
            initGame();
        };

        this.startTestGame = function (){
            startKITestGames();
        };

        this.startGame = function (){
            // Warten auf Spielereingabe
        };

        // ------------------------------------


    };

    GameManager.$inject = injectList;
    angular.module('maxit.game').service('GameManager', GameManager);
}());
