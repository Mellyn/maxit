/**
 * TileModel.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.1.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */

(function () {

    var injectList = [];
    /**
     * @memberof maxit.game
     * @ngdoc service
     * @returns {Tile}
     * @constructor
     */
    var TileModel = function () {
        /**
         *
         * @param pos
         * @param val
         * @param index
         * @constructor
         */
        var Tile = function (pos, val, index) {

            var tVal = val || 0;
            var self = this;
            var tPrefix = "pos";

            if (val < 0) {
                tPrefix = "neg";
                tVal = tVal * (-1);
            }

            self.deleted = false;
            self.x = pos.x;
            self.y = pos.y;
            self.index = index;
            self.value = tVal;
            self.sign = tPrefix;
            self.selectedTile = false;
            self.availableTile = false;
            self.score = val;


            self.getScore = function (){
                return this.score;
            };

            self.getPosition = function () {
                return {
                    x: self.x,
                    y: self.y
                };
            };

            self.deleteMe= function () {
                self.value = undefined;
                self.score = 0;
                self.deleted = true;
            };


        };

        return Tile;
    };

    TileModel.$inject = injectList;
    angular.module('maxit.game').factory('TileModel', TileModel);

}());