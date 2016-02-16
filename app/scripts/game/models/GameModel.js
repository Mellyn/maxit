/**
 * GameModel.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.6.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */

(function () {

    var injectList = [];
    /**
     * @memberof maxit.game
     * @ngdoc factory
     * @returns {Game}
     * @constructor
     */
    var GameModel = function () {

        /**
         *
         * @param _gameBoard
         * @constructor
         */
        var Game = function (_gameBoard) {

            var self = this;
            var gameBoard = angular.copy(_gameBoard);

            self.getUIGameData = function () {
                return {
                    tiles: gameBoard.getBoardTiles(),
                    gameSize: gameBoard.getFieldSize()
                }
            };

            self.getBoard = function () {
                return gameBoard;
            };
        };
        return Game;
    };

    GameModel.$inject = injectList;
    angular.module('maxit.game').factory('GameModel', GameModel);
}());
