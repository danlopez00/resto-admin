module.exports = function (grunt) {

    grunt.initConfig({
        distFolder: 'dist',
        uglify: {
            main: {
                files: {
                    'dist/app/components/main.min.js': [
                        'dev/app/components/app.module.js',
                        'dev/app/components/app.mainController.js',
                        'dev/app/components/app.configuration.js',
                        'dev/app/components/app.routes.js',
                        'dev/app/components/services/API/*.js',
                        'dev/app/components/*/*.js'
                    ],
                    'dist/assets/libs/libs.min.js': [
                        'dev/assets/libs/angular/angular.js/angular-route.js',
                        'dev/assets/libs/angular/ng-infinite-scroll/ng-infinite-scroll.js',
                        'dev/assets/libs/foundation/foundation.min.js'
                    ]
                }
            }
        },
        cssmin: {
            internals: {
                files: [{
                        expand: true,
                        cwd: 'dev/assets/css',
                        src: [
                            '*.css',
                            '!*.min.css'
                        ],
                        dest: 'dist/assets/css',
                        ext: '.min.css'
                    }]
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'dev/assets/libs/jquery/1.12.3/jquery-1.12.3.min.js',
                    'dev/assets/libs/angular/angular.js/angular.min.js',
                    'dev/assets/libs/Chart-1.0.2/Chart.min.js',
                    'dev/assets/libs/angular/angular-chart-0.8.8/angular-chart.min.js',
                    'dev/assets/libs/angular/angular-datepicker/angular-datepicker.min.js',
                    'dev/assets/libs/angular/angular-flash-2.2.7/angular-flash.min.js',
                    'dev/assets/libs/angular/angular-translate/angular-translate.min.js',
                    'dev/assets/libs/angular/angular-translate/angular-translate-loader-static-files.min.js',
                    'dev/assets/libs/angular/angular-cookies/angular-cookies.min.js',
                    'dev/assets/libs/angular/satellizer/satellizer.min.js',
                    'dev/assets/libs/jwt-decode.min.js',
                    'dev/assets/libs/ol3/v3.14.2/ol.js'
                ],
                dest: 'dist/assets/libs/libs.js'
            }
        },
        copy: {
            main: {
                src: [
                    //'assets/libs/**',
                    'assets/libs/angular/angular-flash-2.2.7/angular-flash.min.css',
                    'assets/libs/angular/angular-datepicker/angular-datepicker.min.css',
                    'assets/libs/angular/angular-chart-0.8.8/angular-chart.css',
                    'assets/libs/foundation/css/foundation.css',
                    'assets/libs/foundation/foundation-icons/foundation-icons.css',
                    'assets/libs/foundation/foundation-icons/**',
                    'assets/libs/foundation/css/normalize.css',
                    'assets/libs/ol3/v3.14.2/ol.css',
                    'assets/css/img/**',
                    'app/html/**',
                    'app/i18n/**',
                    'data/countries.geojson',
                    'app/components/app.constant.js'
                ],
                expand: true,
                cwd: 'dev',
                dest: 'dist'
            }
        },
        jshint: {
            all: [
                'dev/app/*.js',
                'dev/app/components/*.js',
                'dev/app/components/*/*.js',
                'dev/app/components/services/API/*.js']
        },
        htmlangular: {
            options: {
                reportpath: 'reports/html-angular-validate-report.json'
            },
            files: {
                src: ['dev/app/html/**/*.html']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-html-angular-validate');
    grunt.loadNpmTasks('grunt-contrib-concat');

    /*
     * grunt build
     * grunt validate
     */
    grunt.registerTask('build', ['uglify', 'cssmin', 'concat', 'copy']);
    grunt.registerTask('validate', ['jshint', 'htmlangular']);
};

