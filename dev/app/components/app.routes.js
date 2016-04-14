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

    angular.module('administration').config([
        '$routeProvider',
        'CONFIG',
        function ($routeProvider, CONFIG) {

            if (CONFIG.statistics) {
                $routeProvider.when('/stats', {
                    templateUrl: "app/html/stats/stats.html",
                    controller: "StatsController"
                });
            }

            $routeProvider
                    .when('/home', {
                        templateUrl: "app/html/home/home.html",
                        controller: "HomeController"
                    })
                    .when('/users', {
                        templateUrl: "app/html/users/users.html",
                        controller: "UsersController"
                    })
                    .when('/collections', {
                        templateUrl: "app/html/collections/collections.html",
                        controller: "CollectionsController"
                    })
                    .when('/collections/:collectionname', {
                        templateUrl: "app/html/collection/collection.html",
                        controller: "CollectionController"
                    })
                    .when('/history', {
                        templateUrl: "app/html/history/history.html",
                        controller: "HistoryController"
                    })
                    .when('/groups', {
                        templateUrl: "app/html/groups/groups.html",
                        controller: "GroupsController"
                    })
                    .when('/groups/:groupid', {
                        templateUrl: 'app/html/group/group.html',
                        controller: 'GroupController'
                    })
                    .when('/users/:userid', {
                        templateUrl: 'app/html/user/user.html',
                        controller: 'UserController'
                    })
                    .when('/users/:userid/:section', {
                        templateUrl: 'app/html/user/user.html',
                        controller: 'UserController'
                    })
                    .when('/userCreation', {
                        templateUrl: 'app/html/userCreation/userCreation.html',
                        controller: 'UserCreationController'
                    })
                    .otherwise({
                        redirectTo: '/home'
                    });

        }]);
})();