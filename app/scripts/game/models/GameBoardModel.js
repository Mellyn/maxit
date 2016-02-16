/**
 * GameBoardModel.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.1.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {
    "use strict";

    var injectList = ['$log', 'TileModel', 'GameData', 'conf', 'enums'];
    /**
     * @memberof maxit.game
     * @ngdoc service
     * @param $log
     * @param TileModel
     * @param GameData
     * @param conf
     * @param enums
     * @returns {GameBoard}
     * @constructor
     */
    var GameBoardModel = function ($log, TileModel, GameData, conf, enums) {
        /**
         *
         * @constructor
         */
         var GameBoard = function (){

            var self = this;
            var fieldSize = GameData.getFieldSize();
            var quadrFieldSize  = fieldSize * fieldSize;
            var fieldNumbers =  GameData.getBoardField(fieldSize);
            var tiles = [];

            var vectors = {
                'left': {x: -1, y: 0},
                'right': {x: 1, y: 0},
                'up': {x: 0, y: -1},
                'down': {x: 0, y: 1}
            };


            // Public Attributes
            self.getFieldSize = function(){
                return fieldSize;
            };

            self.getBoardTiles= function(){
                return tiles;
            };

            self.getTile = function (index){
                return tiles[index];
            };

            self.resetConfig = function(newFieldSize){
                tiles = [];
                fieldSize = newFieldSize || GameData.getFieldSize();
                quadrFieldSize  = fieldSize * fieldSize;
                fieldNumbers =  GameData.getBoardField(fieldSize);
            };

            // -------------------------------------------------#
            // -------------------------------------------------#


            // Next Position on Moving
            self.getNextPosition = function (position, key, currentDirection) {

                var vector = vectors[key];
                if (vector){

                    var xPos =  position.x;
                    var yPos =  position.y;

                    //'left': {x: -1, y: 0},
                    //'right': {x: 1, y: 0},
                    //'up': {x: 0, y: -1},
                    //'down': {x: 0, y: 1}


                    if (currentDirection === enums.directions.HORIZONTAL){
                        if (key=='left' || key=='right'){
                            xPos =  position.x + vector.x;
                        }else{
                            return null;
                        }
                    }else{
                        if (key=='up' || key=='down'){
                            yPos =  position.y + vector.y;
                        }else{
                            return null;
                        }
                    }



                    if (self._coordinatesWithinGrid(xPos,yPos)){
                        return ({x:xPos, y:yPos})
                    }else{
                        return (null);
                    }
                }else{
                    return (null);
                }

            };

            // Changing Cursor-Position
            self.changePosition = function(oldPosition, newPosition){
                self.hidePosition(oldPosition);
                self.findPosition(newPosition);
            };



            // Start Functions (public)----------------------
            // --------------------------------------

            // initialize the field (tiles)
            self.buildEmptyBoard = function () {
                var self = this;
                self._forEach(function (x, y) {
                    self._setCellAt({x: x, y: y}, null);
                });
            };

            // Places random numbers on the field
            self.buildRandomFields = function (){
                for (var i = 0; i < fieldNumbers.length; i++) {
                    var cell = self._randomAvailableCell();
                    if (!(cell===undefined)){
                        var tile = self.newTile(cell, fieldNumbers[i]);
                        self.insertTile(tile);
                    }
                }
            };

            // Creates always the same numbers in field
            self.buildDefinedFields = function (){
                for (var i = 0; i < quadrFieldSize; i++) {
                    var pos = self._positionToCoordinates(i);
                    var tile = self.newTile({
                        x: pos.x,
                        y: pos.y
                    }, fieldNumbers[i]);
                    self.insertTile(tile);
                }
            };

            // Ony for CVC Test store Boards
            self.restoreTiles = function (tiles){
                for (var i = 0; i < quadrFieldSize; i++) {
                    var tile = tiles[i];
                    var newTile = self.newTile({
                        x: tile.x,
                        y: tile.y
                    }, tile.score);
                    self.insertTile(tile);
                }
            };

            self.backUpTiles= function(){
                var newTiles = [];
                for (var i = 0; i <  quadrFieldSize; i++) {
                    var tile = self.getTile(i);
                    var newTile = self.newTile({
                        x: tile.x,
                        y: tile.y
                    }, tile.score);
                    newTiles[i] = newTile;
                }
                return newTiles;
            };

            // Tiles
            // -------------------------------

            // Show the Tiles to go in a differnt color
            self.findAvailableTiles = function (direction, pos) {
                var ok=false;
                if (direction === enums.directions.HORIZONTAL){
                    self._forEachColumnCell (pos.y, function(currentCell){
                        currentCell.availableTile = true;
                        if (currentCell.deleted == false){
                            ok=true;
                        }
                    });
                }else{
                    self._forEachRowCell(pos.x, function(currentCell){
                        currentCell.availableTile = true;
                        if (currentCell.deleted == false){
                            ok=true;
                        }
                    });
                }

                return ok;
            };

            // clears the Tiles
            self.clearAvailableTiles = function(){
                for (var i = 0; i < quadrFieldSize; i++) {
                    var cell = tiles[i];
                    if (cell){
                        cell.availableTile = false;
                    }

                }
            };

            // Shows the current position with a border
            self.findPosition = function (pos) {
                var cell = self._getCellAt({x:pos.x,y:pos.y});
                cell.selectedTile = true;
            };

            // Hides the former position , deletes the border
            self.hidePosition = function (pos) {
                var cell = self._getCellAt({x:pos.x,y:pos.y});
                cell.selectedTile = false;
            };

            //Checks if Tile is ok (For click event)
            this.isTilePossibleTurn = function (index) {
                var cell = self.getTile(index);
                return  (cell.availableTile==true && cell.deleted==false);
            };


            // -------------------------------
            // ------------------------------


            // Help Functions  -------------
            // -----------------------------


            // Cells
            // -------------------------------

            // Search randomly a cell
            self._randomAvailableCell = function () {
                var cells = self._availableCells();
                if (cells.length > 0) {
                    return cells[Math.floor(Math.random() * cells.length)];
                }
            };

            // Returns all available cells
            self._availableCells = function () {
                var cells = [],
                    self = this;

                self._forEach(function (x, y) {
                    var foundTile = self._getCellAt({x: x, y: y});
                    if (!foundTile) {
                        cells.push({x: x, y: y});
                    }
                });

                return cells;
            };

            // Returns Cell at a specific position
            self._getCellAt = function (pos) {
                if (self._withinGrid(pos)) {
                    var x = self._coordinatesToPosition(pos);
                    return tiles[x];
                } else {
                    return null;
                }
            };

            // Sets Cell at a specific position
            self._setCellAt = function (pos, tile) {
                if (self._withinGrid(pos)) {
                    var xPos = self._coordinatesToPosition(pos);
                    tiles[xPos] = tile;
                }
            };

            // -------------------------------------


            // Runs a callback for every cell
            self._forEach = function (cb) {
                for (var i = 0; i < quadrFieldSize; i++) {
                    var pos = self._positionToCoordinates(i);
                    cb(pos.x, pos.y, tiles[i]);
                }
            };

            // Runs callback for the cols
            self._forEachColumnCell  = function (row, cb) {
                for (var x = 0; x < fieldSize; x++) {
                    var cell = self._getCellAt({x:x,y:row});
                    if (cell){
                        cb(cell);
                    }
                }
            };

            // Runs callback for the rows
            self._forEachRowCell  = function (column, cb) {
                for (var y = 0; y < fieldSize; y++) {
                    var cell = self._getCellAt({x:column,y:y});
                    if (cell){
                        cb(cell);
                    }
                }
            };

            // Tile Functions ----------------------
            // -------------------------------------

            self.newTile = function (pos, value) {
                var index = self._coordinatesToPosition(pos);
                return new TileModel(pos, value, index);
            };
            self.insertTile = function (tile) {
                var pos = self._coordinatesToPosition(tile);
                tiles[pos] = tile;
            };
            self.removeTile = function (pos) {
                pos = self._coordinatesToPosition(pos);
                var cell = tiles[pos];
                cell.deleteMe();
            };


            // Convert Position Functions
            // -------------------------------------

            // Position To Coordinate
            self._positionToCoordinates = function (i) {
                var x = i % fieldSize,
                    y = (i - x) / fieldSize;
                return {
                    x: x,
                    y: y
                };
            };

            // Coordinate To Position
            self._coordinatesToPosition = function (pos) {
                return (pos.y * fieldSize) + pos.x;
            };

            // Returns true if coordinates are in grid
            self._coordinatesWithinGrid = function (x,y) {
                return x >= 0 && x < fieldSize &&
                    y >= 0 && y < fieldSize;
            };

            // Returns true if position is in grid
            self._withinGrid = function (cell) {
                return cell.x >= 0 && cell.x < fieldSize &&
                    cell.y >= 0 && cell.y < fieldSize;
            };
        };
        return GameBoard;
    };

    GameBoardModel.$inject = injectList;
    angular.module('maxit.game').service('GameBoardModel', GameBoardModel);

}());


