(function() {

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

    /* Controller Users */

    /*
     * users : 
     * 
     * [
     {
     "userid": "74",
     "email": "user_0",
     "groupname": "user_0",
     "username": "user_0",
     "givenname": null,
     "lastname": null,
     "registrationdate": "2014-12-03T14:25:54Z",
     "activated": true,
     "lastsessionid": null
     },
     ...
     ]
     */

    angular.module('administration').controller('UsersController', ['$scope', '$location', '$filter', 'administrationServices', 'administrationAPI', 'CONFIG', usersController]);

    function usersController($scope, $location, $filter, administrationServices, administrationAPI, CONFIG) {

        if (administrationServices.isUserAnAdministrator()) {



            /*
             * Get users
             */
            $scope.getUsers = function(concat) {

                /*
                 * if no data concatenation, reset start index
                 */
                if (!concat) {
                    $scope.initCounter();
                }

                /*
                 * Options to create loading url
                 * @type Array
                 */
                var options = [];
                options['limit'] = $scope.limit;
                options['offset'] = $scope.offset;

                /*
                 * Check if a keyword is written in the search bar
                 */
                if ($scope.keyword && $scope.keyword !== '') {
                    options['keyword'] = $scope.keyword;
                }

                /*
                 * Get results 
                 */
                administrationAPI.getUsers(options, function(data) {

                    if (data.ErrorMessage) {
                        alert('error - ' + data.ErrorMessage);
                    } else {
                        if (concat) {
                            $scope.users = $scope.users.concat(data);
                        } else {
                            $scope.users = data;
                        }

                        /*
                         * increment start index
                         */
                        $scope.offset = $scope.offset + $scope.limit;

                        /*
                         * show table of results
                         */
                        $scope.showUsers = true;

                        /*
                         * At the end of data
                         */
                        if (!data[0]) {
                            $scope.offset = $scope.offset - $scope.limit;
                        }
                    }


                }, function(){
                    alert($filter('translate')('error.cannot_get_users'));
                });
            };

            /**
             * Select user
             * 
             * @param {String} user
             * 
             */
            $scope.selectUser = function(user) {
                $scope.init();
                $scope.selectedUser = user;
                $location.path($location.path() + '/' + user.userid);
            };

            /*
             * Called by infinite scroll
             */
            $scope.loadMore = function() {
                $scope.getUsers(true);
            };

            /*
             * init the context
             */
            $scope.init = function() {
                $scope.users = [];
                $scope.showUsers = false;
                $scope.selectedUser = null;
                $scope.keyword = null;

                $scope.initCounter();
                $scope.$emit('showUsers');
            };

            /*
             * init counter startindex and offset
             */
            $scope.initCounter = function() {
                $scope.offset = 0;
                $scope.limit = CONFIG.limit;
            };

            $scope.init();
            $scope.getUsers(false);
            
        }
    }
    ;
})();