/**
 * GameController.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.1.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {
    "use strict";

    var injectList = ['$scope', '$location', '$log', 'GameData', 'GameManager', 'Keyboard', 'conf', 'enums'];
    /**
     * @memberof maxit.ui
     * @ngdoc controller
     * @param $scope
     * @param $location
     * @param $log
     * @param GameData
     * @param GameManager
     * @param Keyboard
     * @param conf
     * @param enums
     * @constructor
     */
    var GameController = function ($scope, $location, $log, GameData, GameManager, Keyboard, conf, enums) {

        // Standard Values
        $scope.version = conf.version;

        // Größe der Felder
        $scope.fieldList = GameData.getFieldSizeCombo();
        $scope.selectedFieldIndex = GameData.getDefaultFieldSizeIndex();

        // PlayerGegenKI etc
        $scope.typeList = GameData.getGameTypeCombo();
        $scope.selectedTypeIndex = GameData.getDefaultTypeIndex();

        // KI Stärke
        $scope.kiList= GameData.getGameKICombo();
        $scope.selectedKIIndex = GameData.getDefaultKIIndex();




        // Changing ComboBoxes
        // -------------------
        $scope.gameTypeChanged = function(){
            $scope.sthChanged = true;
            GameData.changeGameType($scope.selectedTypeIndex);
            $log.log("GameType geändert:", $scope.selectedTypeIndex);

            setKIComboBox();
            setPlayerText();

        };

        $scope.gameSizeChanged = function(){
            $scope.sthChanged = true;
            GameData.changeFieldSize($scope.selectedFieldIndex);
            $log.log("Feldgröße geändert:", $scope.selectedFieldIndex);
        };

        $scope.gameKIChanged = function(){
            $scope.sthChanged = true;
            GameData.changeKIType(enums.directions.VERTICAL,$scope.selectedKIIndex);
            $log.log("KI geändert:", $scope.selectedKIIndex);
        };

        // -------------------

        $scope.clickedOnATile= function(tIndex){
            GameManager.clickedOnTile(tIndex);
        };

        $scope.goToUrl = function ( path ) {
            $location.path( path );
        };


        // Events
        // Event - Score changed - End of Player Turn
        $scope.$on('player1:end', function(event,data) {
            playerRoundEnd(data.updateui);
        });

        // Event - Score changed - End of Player Turn
        $scope.$on('player2:end', function(event,data) {
            playerRoundEnd(data.updateui);
        });

        //  Event - - Score changed - End of KI Turn
        $scope.$on('ki:endTurn', function(event,data) {

            $scope.$apply(function () {
                applyGame();
            });

        });


        // PRIVATE Functions
        function playerRoundEnd(updateUI){

            applyGame();
            if (updateUI===true){
                $scope.$digest();
            }
            setTimeout(function () {
                GameManager.continueGame();
            },  getTimeOutValue());
        }

        function applyGame(){
            updatePlayerScore();
            checkIfGameIsOver();
        }

        function updatePlayerScore(){
            $scope.score1 = GameManager.getPlayerScore(enums.players.PLAYER1);
            $scope.score2 = GameManager.getPlayerScore(enums.players.PLAYER2);
        }

        function checkIfGameIsOver(){

            if (GameManager.isGameOver()===true){

                var mode = GameData.getGameMode();
                var winner = "";

                if ($scope.score1 > $scope.score2){
                    winner = "1";
                }else{
                    if ($scope.score2 > $scope.score1){
                        winner = "2";
                    }else{
                        winner = "0";
                        $scope.winText = "Unentschieden";
                        $scope.gameOver=true;
                        return;
                    }
                }

                switch (mode){
                    case enums.gameMode.PLAYERVSPLAYER:
                        $scope.winText = "Spieler " + winner + " hat gewonnen";
                        break;
                    case enums.gameMode.PLAYERVSKI:
                        if (winner === "1"){
                            $scope.winText = "Du hast gewonnen";
                        }else{
                            $scope.winText = "Computer hat gewonnen";
                        }
                        break;
                    case enums.gameMode.KIVSKI:
                        $scope.winText = "Computer " + winner + " hat gewonnen";
                        break;
                }

                $scope.gameOver=true;
            }
        }

        function getTimeOutValue(){
            return 650;
        }


       function setPlayerText (){
            if (GameData.getGameMode() == enums.gameMode.PLAYERVSPLAYER){
                $scope.type1 = "sp1";
                $scope.type2 = "sp2";
            }else{
                $scope.type1 = "sp";
                $scope.type2 = "c";
            }
        }

        function setKIComboBox(){
            if (GameData.getGameMode()== enums.gameMode.PLAYERVSPLAYER){
                $scope.KIdisabled = true;
                GameData.getDefaultKIIndex();
            }else{
                $scope.KIdisabled = false;
            }
        }

        // INITIALIZE GAME
        function initKeyBoardEvent(){
            Keyboard.on(function (key) {
                GameManager.move(key);
            });
        }

        function initScopeVars(){

            $scope.game = GameManager.getGame();
            $scope.score1 = GameManager.getPlayerScore(enums.players.PLAYER1);
            $scope.score2 = GameManager.getPlayerScore(enums.players.PLAYER2);

            $scope.gameOver=false;
            $scope.gamend=false;
            $scope.sthChanged = false;

            setKIComboBox();
            setPlayerText();
        }

        $scope.resetGame = function () {
            $scope.game = undefined;
            GameManager.newGame();
            initScopeVars();
        };

        function init(){
            Keyboard.initialize();
            initKeyBoardEvent();

            GameManager.newGame();
            initScopeVars();
        }

        init();

    };

    GameController.$inject = injectList;
    angular.module('maxit.ui').controller('GameController', GameController);

}());
