/**
 * AIAction.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.3.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {
    "use strict";

    var injectList = ['$log', 'enums', 'AIBoardTile'];
    /**
     * @memberof maxit.ai
     * @ngdoc service
     * @param $log
     * @param enums
     * @param AIBoardTile
     * @constructor
     */
    var AIAction = function ($log, enums, AIBoardTile) {

        var self = this;

        this.isMovePossible = function (board) {
            var direction = board.direction;
            var pos = board.position;
            var fieldSize = board.length;
            var tiles = board.tiles;

            var ok = false;
            var index = 0;
            var cell;

            if (direction === enums.directions.HORIZONTAL) {
                for (var x = 0; x < fieldSize; x++) {
                    index = this._getIndexAt({x: x, y: pos.y}, fieldSize);
                    cell = tiles[index];
                    if (tiles[index]) {
                        if (cell.deleted === false) {
                            ok = true;
                            break;
                        }
                    }
                }
            } else {
                for (var y = 0; y < fieldSize; y++) {
                    index = this._getIndexAt({x: pos.x, y: y}, fieldSize);
                    cell = tiles[index];
                    if (cell) {
                        if (cell.deleted === false) {
                            ok = true;
                            break;
                        }
                    }
                }
            }
            return ok;
        };

        this.getAvailableTiles = function (board) {

            var direction = board.direction;
            var fieldSize = board.length;
            var pos = board.position;
            var index = 0;
            var cell;
            var tiles = board.tiles;
            var arrTiles = [];

            if (direction === enums.directions.HORIZONTAL) {
                for (var x = 0; x < fieldSize; x++) {
                    index = this._getIndexAt({x: x, y: pos.y}, fieldSize);
                    cell = tiles[index];
                    if (tiles[index]) {
                        if (cell.deleted === false) {
                            arrTiles.push(index);
                        }
                    }
                }
            } else {
                for (var y = 0; y < fieldSize; y++) {
                    index = this._getIndexAt({x: pos.x, y: y}, fieldSize);
                    cell = tiles[index];
                    if (cell) {
                        if (cell.deleted === false) {
                            arrTiles.push(index);
                        }
                    }
                }
            }
            if (arrTiles.length == 0) {
                return null;
            }
            return arrTiles;
        };

        this.getMoves = function (board, player) {
            var arrTiles = [];
            var tiles = board.tiles;
            var pos = board.position;
            var fieldSize = board.length;

            var faktor = 1;
            var negFactor = 1;
            var index = 0;
            var score = 0;
            var cell;

            if (player === enums.directions.HORIZONTAL) {
                negFactor = (-1);
            }

            if (board.direction === enums.directions.HORIZONTAL) {

                for (var x = 0; x < fieldSize; x++) {
                    faktor = (-1) * (negFactor);
                    index = this._getIndexAt({x: x, y: pos.y}, fieldSize);
                    cell = tiles[index];
                    if (cell) {
                        score = cell.score;
                        if (cell.deleted === false) {
                            cell.evaluationValue = (score * faktor) + board.evaluationValue;
                            arrTiles.push(cell);
                        }
                    }
                }
            } else {
                for (var y = 0; y < fieldSize; y++) {
                    faktor = (negFactor);
                    index = this._getIndexAt({x: pos.x, y: y}, fieldSize);
                    cell = tiles[index];
                    if (cell) {
                        score = cell.score;
                        if (cell.deleted === false) {
                            cell.evaluationValue = (score * faktor) + board.evaluationValue;
                            arrTiles.push(cell);
                        }
                    }
                }
            }

            if (arrTiles.length == 0) {
                return null;
            }
            return arrTiles;
        };

        this.getMovesNegamax = function (board) {

            var view = board.KIView;
            var arrTiles = [];
            var tiles = board.tiles;
            var pos = board.position;
            var fieldSize = board.length;
            var index = 0;
            var score = 0;
            var cell;


            if (board.direction === enums.directions.HORIZONTAL) {

                for (var x = 0; x < fieldSize; x++) {
                    index = this._getIndexAt({x: x, y: pos.y}, fieldSize);
                    cell = tiles[index];
                    if (cell) {
                        score = cell.score;
                        if (cell.deleted === false) {
                            cell.evaluationValue = (score + board.evaluationValue) * view;
                            arrTiles.push(cell);
                        }
                    }
                }
            } else {
                for (var y = 0; y < fieldSize; y++) {
                    index = this._getIndexAt({x: pos.x, y: y}, fieldSize);
                    cell = tiles[index];
                    if (cell) {
                        score = cell.score;
                        if (cell.deleted === false) {
                            cell.evaluationValue = (score + board.evaluationValue) * view;
                            arrTiles.push(cell);
                        }
                    }
                }
            }

            if (arrTiles.length == 0) {
                return null;
            }
            return arrTiles;
        };

        this.makeMove = function (board, tile) {
            var newBoard = angular.copy(board);

            newBoard.direction = this._switchDirection(board);
            newBoard.position = tile.position;
            newBoard.index = tile.index;
            newBoard.evaluationValue = tile.evaluationValue;

            var deletedTile = newBoard.tiles[tile.index];
            deletedTile.deleted = true;

            return newBoard;
        };


        // Helper
        this._getIndexAt = function (pos, fieldSize) {
            if (this._withinGrid(pos, fieldSize)) {
                return (this._coordinatesToPosition(pos, fieldSize));
            } else {
                return null;
            }
        };

        this._switchDirection = function (board) {
            if (board.direction === enums.directions.VERTICAL) {
                return (enums.directions.HORIZONTAL);
            } else {
                return (enums.directions.VERTICAL);
            }
        };

        this._withinGrid = function (cell, fieldSize) {
            return cell.x >= 0 && cell.x < fieldSize &&
                cell.y >= 0 && cell.y < fieldSize;
        };

        this._coordinatesToPosition = function (pos, fieldSize) {
            return (pos.y * fieldSize) + pos.x;
        };

    };


    AIAction.$inject = injectList;
    angular.module('maxit.ai').service('AIAction', AIAction);

}());


