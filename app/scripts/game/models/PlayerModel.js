/**
 * PlayerModel.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.6.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {

    var injectList = ['$log', 'enums'];
    /**
     * @memberof maxit.game
     * @ngdoc factory
     * @param $log
     * @param enums
     * @returns {Player}
     * @constructor
     */
    var PlayerModel = function ($log, enums) {
        /**
         *
         * @param id
         * @param playertype
         * @constructor
         */
        var Player = function(id, playertype){

            var self=this;
            var playerID = id;
            var playerType = playertype || enums.playerType.HUMAN;
            var score = 0;

            self.getPlayerData = function (){
                return {
                    id:playerID,
                    type:playerType,
                    score: score
                }
            };

            self.setScore = function(val){
                score = val;
            };
            self.incScore = function(val){
                score += val;
            };
            self.getScore = function(){
                return score;
            };
            self.setPlayerData = function (type, sc){
                playerType = type;
                score = sc || 0;
            }

        };

        return Player;

    };

    PlayerModel.$inject = injectList;
    angular.module('maxit.game').factory('PlayerModel', PlayerModel);

}());

