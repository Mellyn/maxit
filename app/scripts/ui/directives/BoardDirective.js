/**
 * BoardDirective.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.1.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */

(function () {
    'use strict';

    /**
     * @memberof maxit.ui
     * @ngdoc directive
     * @name board
     */
    var board = function () {

        var link = function (scope, element, attrs) {

            scope.clickMe = function(i){
                scope.add({tIndex: i})
            }
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                ngModel: '=',
                add: '&'
            },
            link:link,
            templateUrl: 'templates/boardDirective.html'
        };
    };
    angular.module('maxit.ui').directive('board', board);

}());