/**
 * GameData.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.2.1
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function() {

    var injectList = ['$log', 'gameVars', 'enums'];
    /**
     * @memberof maxit.game
     * @ngdoc service
     * @name GameData
     * @param $log
     * @param gameVars
     * @param enums
     * @constructor
     */
    var GameData = function($log, gameVars, enums) {

        var fieldSizeList = [
            {id:4, name: 'Feldgröße: 4x4'},
            {id:8, name: 'Feldgröße: 8x8'}
        ];

        var gameTypeList = [
            {id:enums.gameMode.PLAYERVSKI, type: 'Spieler vs Computer'},
            {id:enums.gameMode.PLAYERVSPLAYER, type: 'Spieler vs Spieler'}
        ];

        var gameKIList = [
            {id:enums.KIType.EASY, type: 'Einfach'},
            {id:enums.KIType.MIDDLE, type: 'Fair'},
            {id:enums.KIType.HARD, type: 'Profi'}
        ];


        // Field Size Functions
        this.getFieldSizeCombo = function(){
            return fieldSizeList;
        };
        this.getGameTypeCombo = function(){
            return gameTypeList;
        };
        this.getGameKICombo = function(){
            return gameKIList;
        };


        this.getDefaultFieldSizeIndex = function (){
            return gameVars.fieldSize;
        };
        this.getDefaultTypeIndex = function (){
            return gameVars.gameMode;
        };
        this.getDefaultKIIndex = function (){
            return gameVars.KIType[2];
        };


        this.getFieldSize = function (){
            return gameVars.fieldSize;
        };
        this.getKIType = function(value){
            return  gameVars.KIType[value];
        };
        this.getGameMode= function(){
            return gameVars.gameMode;
        };
        // Only Readable
        this.getBoardField = function(size){
            return  gameVars.field[size];
        };


        this.changeFieldSize = function(value){
            gameVars.fieldSize =  value;
        };
        this.changeGameType= function(value){
            gameVars.gameMode = value;
        };
        this.changeKIType= function(index, value){
            gameVars.KIType[index] = value;
        };

    };

    GameData.$inject = injectList;
    angular.module('maxit.app.config', []);
    angular.module('maxit.app.config').service('GameData', GameData);

}());
