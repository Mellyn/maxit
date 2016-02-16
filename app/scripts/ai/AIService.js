/**
 * AIService.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.3.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {
    "use strict";
    var injectList = ['$log', 'enums', 'AIAction', 'AIBoardTile', 'conf'];
    /**
     * @memberof maxit.ai
     * @ngdoc service
     * @param $log
     * @param enums
     * @param AIAction
     * @param AIBoardTile
     * @param conf
     * @constructor
     */
    var AIService = function ($log, enums, AIAction, AIBoardTile, conf) {

        var kiType = enums.KIType.EASY;
        var self = this;

        this.getBestMove = function (gameBoard, currentDirection, currentPosition, currentKIType, evaluationValue, push) {

            kiType = currentKIType;

            var currentDepth = 0;
            var maxDepth = 1;

            // Board kopieren
            var boardArray = copyBoard(gameBoard);
            var board = {
                tiles: boardArray,
                length: gameBoard.getFieldSize(),
                direction: currentDirection,
                index: gameBoard._coordinatesToPosition(currentPosition),
                evaluationValue: evaluationValue,
                KIView: enums.KIView.MAX,
                position: currentPosition
            };


            switch (kiType) {

                case enums.KIType.RANDOM:
                    $log.info("RANDOM!");
                    return randomMove(board);
                    break;
                case enums.KIType.EASY:
                    $log.info("EASY!");
                    maxDepth = 1;
                    return bestMoveEASY(board, currentDepth, maxDepth);
                    break;
                case enums.KIType.MIDDLE:
                    $log.info("MIDDLE!");
                    maxDepth = 2;
                    return bestMove(board, currentDepth, maxDepth);
                    break;
                case enums.KIType.HARD:
                    if (push) {
                        maxDepth = 4;
                        $log.info("HARD! + PUSH");
                    } else {
                        maxDepth = 3;
                        $log.info("HARD!");
                    }
                    return bestMove(board, currentDepth, maxDepth);
                    break;
                default:
                    $log.info("DEFAULT EASY!");
                    maxDepth = 1;
                    return bestMove(board, currentDepth, maxDepth);
                    break;
            }
        };

        /**
         * @function bestMove
         * @param board
         * @param currentDepth
         * @param maxDepth
         * @returns {*}
         */
        function bestMove(board, currentDepth, maxDepth) {
            // Minimax
            //var player = board.direction;
            //var bestMove = minimax(board, player, currentDepth, maxDepth);

            // Negamax
            // var bestMove = negamax(board, currentDepth, maxDepth);

            // ABPruning
            var bestMove = abNegamaxPruning(board, currentDepth, maxDepth, -Infinity, Infinity);

            $log.info("ENDE mit Ergebnis: ", bestMove);
            return bestMove;
        }

        function bestMoveEASY(board, currentDepth, maxDepth) {
            var bestMove = negamax(board, currentDepth, maxDepth);
            $log.info("ENDE mit Ergebnis: ", bestMove);
            return bestMove;
        }


        // SEARCH-ALGORITHMS

        function minimax(board, player, currentDepth, maxDepth) {
            var moveIsPossible = AIAction.isMovePossible(board);
            $log.info("MovePossible", moveIsPossible);

            // Abruchbedingung (maxDepth oder Spielende)
            if (currentDepth === maxDepth || moveIsPossible == false) {
                var retValue = {
                    bestEvalValue: board.evaluationValue,
                    bestMove: undefined
                };
                return (retValue);
            } else {

                var bestEvalValue = Infinity;
                if (player == board.direction) {
                    bestEvalValue = -Infinity;
                }

                var availableMoves = AIAction.getMoves(board, player);
                $log.log("MiniMax-Moves auf Ebene :", currentDepth, availableMoves);

                var bestMove = 0;
                for (var i = 0; i < availableMoves.length; i++) {

                    var newBoard = AIAction.makeMove(board, availableMoves[i]);
                    // $log.log("NewBoard:", newBoard);
                    // Rekursion
                    var currentValue = minimax(newBoard, player, (currentDepth + 1), maxDepth);

                    if (player == board.direction) {
                        if (currentValue.bestEvalValue > bestEvalValue) {
                            bestEvalValue = currentValue.bestEvalValue;
                            bestMove = availableMoves[i].index;
                        }
                    } else {
                        if (currentValue.bestEvalValue < bestEvalValue) {
                            bestEvalValue = currentValue.bestEvalValue;
                            bestMove = availableMoves[i].index;
                        }
                    }
                }
                var bestRetValue = {
                    bestEvalValue: bestEvalValue,
                    bestMove: bestMove
                };
                $log.log("EVALUATE:", bestRetValue);
                return (bestRetValue);
            }

        }

        function negamax(board, currentDepth, maxDepth) {
            var moveIsPossible = AIAction.isMovePossible(board);
            // Abruchbedingung (maxDepth oder Spielende)
            if (currentDepth === maxDepth || moveIsPossible == false) {
                var retValue = {
                    bestEvalValue: board.evaluationValue,
                    bestMove: undefined
                };
                return (retValue);
            } else {

                var bestMove = 0;
                var bestEvalValue = -Infinity;

                var availableMoves = AIAction.getMovesNegamax(board);
                $log.log("Negamax-Moves auf Ebene :", currentDepth, availableMoves);

                for (var i = 0; i < availableMoves.length; i++) {

                    var newBoard = AIAction.makeMove(board, availableMoves[i]);
                    // Rekursion
                    var recursedValue = negamax(newBoard, (currentDepth + 1), maxDepth);
                    var currentValue = -(recursedValue.bestEvalValue);

                    if (currentValue > bestEvalValue) {
                        bestEvalValue = currentValue;
                        bestMove = availableMoves[i].index;
                    }
                    else {
                        // Spezialfall wenn die Werte gleich sind
                        if (currentValue === bestEvalValue && (getRandomInt(1, 2) === 1)) {
                            if (conf.airandom === true ) {
                                $log.log("RANDOM VALUE");
                                bestEvalValue = currentValue;
                                bestMove = availableMoves[i].index;
                            }
                        }
                    }
                }
                var bestRetValue = {
                    bestEvalValue: bestEvalValue,
                    bestMove: bestMove
                };
                $log.log("EVAL:", bestRetValue);
                return (bestRetValue);
            }

        }

        function abNegamaxPruning(board, currentDepth, maxDepth, alpha, beta) {
            var moveIsPossible = AIAction.isMovePossible(board);

            if (currentDepth === maxDepth || moveIsPossible == false) {
                var retValue = {
                    bestEvalValue: board.evaluationValue,
                    bestMove: undefined
                };
                return (retValue);
            } else {

                var bestMove = 0;
                var bestEvalValue = -Infinity;

                var availableMoves = AIAction.getMovesNegamax(board);
                $log.log("ABNegamax-Moves auf Ebene :", currentDepth, availableMoves);


                for (var i = 0; i < availableMoves.length; i++) {

                    var newBoard = AIAction.makeMove(board, availableMoves[i]);

                    // Rekursion
                    var recursedValue = abNegamaxPruning(newBoard, (currentDepth + 1), maxDepth, -beta, -(Math.max(alpha, bestEvalValue)));
                    var currentValue = -(recursedValue.bestEvalValue);

                    if (currentValue > bestEvalValue) {
                        bestEvalValue = currentValue;
                        bestMove = availableMoves[i].index;
                    }

                    if (bestEvalValue >= beta) {
                        var ret = {
                            bestEvalValue: bestEvalValue,
                            bestMove: bestMove
                        };
                        return (ret);
                    }
                }
                var bestRetValue = {
                    bestEvalValue: bestEvalValue,
                    bestMove: bestMove
                };
                return (bestRetValue);
            }
        }

        function randomMove(board) {
            var availableTiles = AIAction.getAvailableTiles(board);
            var bestRetValue = {
                bestEvalValue: undefined,
                bestMove: undefined
            };
            if (availableTiles !== null) {
                var length = availableTiles.length;
                var ran = getRandomInt(0, length - 1);
                bestRetValue.bestMove = availableTiles[ran];
            }
            return bestRetValue;
        }

        // HELP FUNCTIONS
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function copyBoard(board) {
            var length = board.getFieldSize();
            var tiles = board.getBoardTiles();
            var quadrFieldSize = length * length;

            var arr = Array(quadrFieldSize);
            for (var i = 0; i < quadrFieldSize; i++) {
                arr[i] = new AIBoardTile(tiles[i].index, tiles[i].deleted, tiles[i].score, {
                    x: tiles[i].x,
                    y: tiles[i].y
                });
            }
            return arr;
        }


    };

    AIService.$inject = injectList;
    angular.module('maxit.ai').service('AIService', AIService);
}());

