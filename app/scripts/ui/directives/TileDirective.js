/**
 * TileDirective.js
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
     * @name tile
     */
    var injectList = ['$rootScope'];
    var tile = function ($rootScope) {

        return {
            restrict: 'A',
            replace: true,
            scope: {
                ngModel: '='
            },
            link: function(scope, element, attrs) {

                $rootScope.$on('position:changed', function(event,data) {
                    element.removeClass('tile-sel');
                    element.removeClass('tile-available-1');
                    element.removeClass('tile-available-2');

                    if (scope.ngModel.selectedTile==true) {
                        element.addClass('tile-sel');
                    }
                    if (scope.ngModel.availableTile==true) {
                        element.addClass('tile-available-1');
                    }
                });

            },
            templateUrl: 'templates/tileDirective.html'
        };
    };

    tile.$inject = injectList;
    angular.module('maxit.ui').directive('tile', tile);

}());