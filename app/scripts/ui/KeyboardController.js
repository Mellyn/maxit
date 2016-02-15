/**
 * Keyboard.js
 *
 * @author Melanie Lucht <mail@maxit.mellyn.de>
 * @since 0.1.0
 *
 * @license For the full copyright and license information, please view the LICENSE file that was distributed with
 * this source code.
 */
(function () {
    "use strict";

    var injectList = ['$log', '$document'];
    /**
     * @memberof maxit.ui
     * @ngdoc service
     * @param $log
     * @param $document
     * @constructor
     */
    var Keyboard = function ($log, $document) {

        var UP = 'up',
            RIGHT = 'right',
            DOWN = 'down',
            LEFT = 'left',
            ENTER = 'enter',
            SPACE = 'space';

        var keyboardMap = {
            37: LEFT,
            38: UP,
            39: RIGHT,
            40: DOWN,
            13: ENTER,
             0: SPACE,
            32: SPACE
        };

        var eventHandler = [];

        function init(){

            var self = this;


            $document.bind('keydown', function (evt) {
                var key = keyboardMap[evt.which];

                if (key) {
                    evt.preventDefault();
                    handleEvent(key, evt);
                }
            });

        }


        function handleEvent(key, evt){

            var callbacks = eventHandler;
            if (!callbacks) {
                return;
            }

            evt.preventDefault();

            if (callbacks) {
                for (var x = 0; x < callbacks.length; x++) {
                    var cb = callbacks[x];
                    cb(key, evt);
                }
            }

        }




        this.on = function (cb) {
            eventHandler.push(cb);
        };




        this._handleKeyEvent = function (key, evt) {
            var callbacks = eventHandler;
            if (!callbacks) {
                return;
            }

            evt.preventDefault();

            if (callbacks) {
                for (var x = 0; x < callbacks.length; x++) {
                    var cb = callbacks[x];
                    cb(key, evt);
                }
            }
        };

        this.initialize = function (){
            init();
        };



    };

    Keyboard.$inject = injectList;
    angular.module('maxit.ui').service('Keyboard', Keyboard);

}());