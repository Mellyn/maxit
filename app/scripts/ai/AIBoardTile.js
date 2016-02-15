/**
 * AIBoardTile.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.6.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */

(function () {
    "use strict";
    var injectList = [];
    /**
     * @memberof maxit.ai
     * @ngdoc factory
     * @returns {BoardTile}
     * @constructor
     */
    var AIBoardTile = function () {
        /**
         *
         * @param _index
         * @param _deleted
         * @param _score
         * @param _position
         * @constructor
         */
        var BoardTile = function(_index, _deleted, _score, _position){

            this.index=_index;
            this.evaluationValue = 0;
            this.deleted =_deleted;
            this.position = _position;
            this.score = _score;
        };
        return BoardTile;
    };

    AIBoardTile.$inject = injectList;
    angular.module('maxit.ai').factory('AIBoardTile', AIBoardTile);
}());
