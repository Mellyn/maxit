module.exports = function (grunt) {

    var folderTmp = "temp";
    var folderDist= "dist";
    var folderDev= "dev";


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            tmp: {src: [folderTmp]},
            dev: {src: [folderDev]},
            dist: {src: [folderDist]}
        },
        concat: {
            options: {
                separator: ';'
            },
            scriptBundle: {
                src: [
                    'app/scripts/MaxitApp.js',
                    'app/scripts/ai/AIModule.js',
                    'app/scripts/ai/AIService.js',
                    'app/scripts/ai/AIAction.js',
                    'app/scripts/ai/AIBoardTile.js',
                    'app/scripts/game/GameModule.js',
                    'app/scripts/game/models/**/*',
                    'app/scripts/game/service/**/*',
                    'app/scripts/ui/UIModule.js',
                    'app/scripts/ui/GameController.js',
                    'app/scripts/ui/KeyboardController.js',
                    'app/scripts/ui/directives/**/*',
                    'app/scripts/data/GameData.js'
                ],
                dest: 'temp/scripts/MaxitScriptBundle.js'
            }
        },
        bowercopy: {
            lib: {
                options: {
                    destPrefix: 'temp',
                    runbower: false
                },
                files: {
                    'lib': [
                        'jquery/dist',
                        'angular/angular.min.js',
                        'angular-route/angular-route.min.js',
                        'angular-touch/angular-touch.min.js'
                    ]
                }
            }
        },
        copy:{
            bootrap_css: {
                files: [
                    {cwd: 'app/styles/bootstrap',
                        src: ['**/*'],
                        dest: 'temp/styles/bootstrap',
                        expand: true
                    }
                ]
            },
            pict: {
                files: [
                    {
                        cwd: 'app/pict/',      // set working folder / root to copy
                        src: [
                            '**/*'
                        ],
                        dest: 'temp/pict',    // destination folder
                        expand: true           // required when using cwd
                    },
                    {
                        cwd: 'app/',      // set working folder / root to copy
                        src: [
                            'favicon.ico'
                        ],
                        dest: 'temp/',    // destination folder
                        expand: true           // required when using cwd
                    }
                ]
            },
            fonts: {
                files: [
                    {
                        cwd: 'app/styles/fonts',      // set working folder / root to copy
                        src: [
                            '**/*'
                        ],
                        dest: 'temp/styles/fonts',    // destination folder
                        expand: true           // required when using cwd
                    }
                ]
            },
            css: {
                files: [
                    {
                        cwd: 'app/styles',      // set working folder / root to copy
                        src: [
                            'main.css'
                        ],
                        dest: 'temp/styles',     // destination folder
                        expand: true           // required when using cwd
                    }
                ]
            },
            templates: {
                files: [
                    {
                        cwd: 'app/templates',     // set working folder / root to copy
                        src: [
                            '**/*'
                        ],
                        dest: 'temp/templates',     // destination folder
                        expand: true           // required when using cwd
                    }
                ]
            },
            dev:{
                files: [
                    {
                        cwd: 'temp',     // set working folder / root to copy
                        src: [
                            '**/*', '!.sass-cache'
                        ],
                        dest: 'dev',     // destination folder
                        expand: true           // required when using cwd
                    }
                ]
            }
        },
        uglify: {
            appFiles: {
                options: {
                    banner: '/*! MaxIT v1.0.0 | Melanie Lucht (mellyn) <%= grunt.template.today("yyyy-mm-dd") %> */ ',
                    mangle: true
                },
                src: 'temp/scripts/MaxitScriptBundle.js',
                dest: 'temp/scripts/MaxitScriptBundle.min.js'
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    cacheLocation: 'temp/.sass-cache'
                },
                files: {
                    "temp/styles/main.css": "app/styles/main.scss"
                }
            },
            dist: {
                options: {
                    style: 'compressed',
                    cacheLocation: 'temp/.sass-cache',
                    sourcemap: 'none'
                },
                files: {
                    "temp/styles/main.min.css": "app/styles/main.scss"
                }
            }
        },
        targethtml: {
            dev: {
                files: {
                    'temp/index.html': 'app/index.html'
                }
            },
            dist: {
                files: {
                    'temp/index.html': 'app/index.html'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('dev',
        [
            'clean:tmp',
            'clean:dev',
            'bowercopy:lib',
            'copy:bootrap_css',
            'copy:pict',
            'copy:fonts',
            'sass:dev',
            'targethtml:dev',
            'copy:templates',
            'concat:scriptBundle',
            'uglify:appFiles',
            'copy:dev',
            'clean:tmp'
        ]);

};