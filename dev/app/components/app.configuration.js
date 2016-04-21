(function () {

    'use strict';

    /*
     * Copyright 2014 Jérôme Gasperi
     *
     * Licensed under the Apache License, version 2.0 (the "License");
     * You may not use this file except in compliance with the License.
     * You may obtain a copy of the License at:
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
     * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
     * License for the specific language governing permissions and limitations
     * under the License.
     */
    /* 
     Created on : 4 mars 2015, 10:27:08
     Author     : remi.mourembles@capgemini.com
     */

    angular.module('administration')
            .config(['$translateProvider', '$authProvider', '$httpProvider', 'CONFIG', configuration]);

    function configuration($translateProvider, $authProvider, $httpProvider, CONFIG) {

        /*
         * Authentication configuration
         */
        $authProvider.baseUrl = '';
        $authProvider.authHeader = 'Authorization';
        $authProvider.loginUrl = CONFIG.restoServerUrl + '/api/user/connect';
        $authProvider.signupUrl = CONFIG.restoServerUrl + '/user';
        $authProvider.loginRedirect = '/ok';

        var key = 'oauth2';
        var redirectUri = window.location.href.split('#')[0];
        var requiredUrlParams = CONFIG.auth[key].requiredUrlParams ? CONFIG.auth[key].requiredUrlParams : [];
        var token = function () {
            return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        };

        /*
         * Authentication providers
         */
        $authProvider.oauth2({
            name: key,
            url: CONFIG.restoServerUrl + '/api/auth/' + key,
            redirectUri: redirectUri,
            clientId: CONFIG.auth[key].clientId,
            authorizationEndpoint: CONFIG.auth[key].authorizeUrl,
            scope: CONFIG.auth[key].scope || null,
            requiredUrlParams: requiredUrlParams,
            state: token()

        });

        /*
         * Internationalization
         * (See app/i18n/{lang}.json)
         */
        $translateProvider.useStaticFilesLoader({
            prefix: 'app/i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');

        /*
         * Display a spinner when http request is in process
         */
        $httpProvider.interceptors.push('myHttpInterceptor');

    }

    /*
     * Http interceptor to display spinner
     */
    angular.module('administration')
            .factory('myHttpInterceptor', [myHttpInterceptor]);

    function myHttpInterceptor($q) {

        /*
         * In case of multiple requests, display spinner until the last request
         * is done
         * @type Number
         */
        var count = 0;

        return {
            // optional method
            'request': function (config) {
                $("#spinner").show();
                count = count + 1;
                return config;
            },
            // optional method
            'requestError': function (rejection) {
                count = count - 1;
                if (count === 0) {
                    $("#spinner").hide();
                }

                //return $q.reject(rejection);
                return rejection;
            },
            // optional method
            'response': function (response) {
                count = count - 1;
                if (count === 0) {
                    $("#spinner").hide();
                }
                return response;
            },
            // optional method
            'responseError': function (rejection) {
                count = count - 1;
                if (count === 0) {
                    $("#spinner").hide();
                }

                //return $q.reject(rejection);
                return rejection;
            }
        };
    }

    /**
     * Change $location.path action.
     * 
     * If reload is true -> reload page content,
     * else -> do not relaod page content
     */
    angular.module('administration')
            .run(['$route', '$rootScope', '$location', run]);

    function run($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }
})();