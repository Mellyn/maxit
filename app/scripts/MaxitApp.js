/**
 * MaxIT Game
 * Main-Module Maxit.js
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
     *
     * @type {angular.IModule}
     */
    var app = angular.module('maxit.app', [
        'ngRoute',
        'maxit.app.config',
        'maxit.ui',
        'maxit.game'
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'GameController',
                templateUrl: "templates/main.html"
            })
            .otherwise( { redirectTo: '/' } );
    }]);

    // Konfiguration
    app.constant('conf', {
        version: '1.0.0',
        logprovider:false,
        debug: false,
        info: false,
        log: false,
        airandom:true,
        kiTest: false
    });

    //Enums
    app.constant('enums', {
        directions: Object.freeze({HORIZONTAL: 1, VERTICAL: 2}),
        players: Object.freeze({PLAYER1: 1, PLAYER2: 2}),
        playerType: Object.freeze({HUMAN: 1, KI: 2}),
        KIType: Object.freeze({EASY: 0, MIDDLE: 1, HARD: 2, RANDOM: 10}),
        gameMode: Object.freeze({PLAYERVSPLAYER: 1, PLAYERVSKI: 2, KIVSKI: 3}),
        gameStatus: Object.freeze({INIT: 1, PLAY: 2, END: 3}),
        KIView: Object.freeze({MAX: -1, MIN: 1}),
        keys: Object.freeze({ENTER: 'enter', SPACE: 'space'})
    });

    // GameDefaults
    app.value('gameVars',{
        gameMode: 2,
        fieldSize: 8,
        KIType: [0,0,0],
        field: [[0], [0], [0], [0],
            [1, 2, 1, 6,
                -4, -4, 2, 1,
                4, -9, 4, 2,
                2, 1, 4, -6],
            [0],[0],[0],
            [4,1,-6,6,1,2,2,-9,
                -4,4,1,2,6,4,4,1,
                4,1,4,2,1,2,6,6,
                4,4,6,2,-6,2,2,-6,
                1,4,-6,4,-4,4,1,2,
                4,9,1,4,2,4,-4,6,
                1,-9,1,2,1,9,1,1,
                1,4,4,1,2,2,2,2]
        ]
    });

    app.config(['$provide', '$logProvider', 'conf', function ($provide, $logProvider, conf) {

        $provide.decorator('$log', ['$delegate', function ($delegate) {

            var origDebug = $delegate.debug;
            var origLog = $delegate.log;
            var origInfo= $delegate.info;

            $delegate.debug = function () {

                if  ($logProvider.debugEnabled() && conf.debug===true){
                    var args = [].slice.call(arguments);
                    args[0] = [dateSplit(), ': ', args[0]].join('');
                    origDebug.apply(null, args);
                }

            };

            $delegate.log= function () {

                if  ($logProvider.debugEnabled() && conf.log===true){
                    var args = [].slice.call(arguments);
                    args[0] = [dateSplit(), ': ', args[0]].join('');
                    origLog.apply(null, args)  ;
                }
            };

            $delegate.info= function () {

                if  ($logProvider.debugEnabled() && conf.info===true){
                    var args = [].slice.call(arguments);
                    args[0] = [dateSplit(), ': ', args[0]].join('');
                    origInfo.apply(null, args)  ;
                }
            };

            function dateSplit(){
                var dateNow = new Date();
                return (dateNow.getHours().toString() + ":" + dateNow.getMinutes().toString() + ":" + dateNow.getSeconds().toString());
            }

            return $delegate;
        }]);

    }]);

    app.config(['$logProvider', 'conf', function($logProvider, conf){
        if (conf.logprovider == undefined || conf.logprovider==false){
            $logProvider.debugEnabled(false);
        }
    }]);

    app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);


}());