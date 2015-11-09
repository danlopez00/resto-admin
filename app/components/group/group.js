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
    /* 
     Author     : remi.mourembles@capgemini.com
     */

    /* Controller Groups */


    angular.module('administration').controller('GroupController', ['$scope', '$routeParams', '$filter', 'administrationServices', 'administrationAPI', 'CONFIG', groupController]);

    function groupController($scope, $routeParams, $filter, administrationServices, administrationAPI, CONFIG) {

        if (administrationServices.isUserAnAdministrator()) {

            /**
             * Get rights groups
             */
            $scope.getGroupsRights = function() {
                administrationAPI.getGroupsRights($scope.groupid, function(data) {
                    $scope.rights = data.rights;
                }, function(data) {
                    alert($filter('translate')('error.getGroupsRights'), data);
                });
            };

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
                administrationAPI.getGroupUsers({
                    groupid: $scope.groupid,
                    limit: $scope.limit,
                    offset: $scope.offset
                }, function(data) {

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
                         * At the end of data
                         */
                        if (!data[0]) {
                            $scope.offset = $scope.offset - $scope.limit;
                        }
                    }
                }, function() {
                    alert("error : cannot get users");
                });
            };

            /*
             * Called by infinite scroll
             */
            $scope.loadMoreUsers = function() {
                $scope.getUsers(true);
            };

            /**
             * Delete groups from user groups
             * 
             * @param {Array} groups 
             * @returns {undefined}
             */
            $scope.removeFromGroup = function(userid) {

                var options = [];
                options.groups = $scope.groupid;
                options.userid = userid;

                administrationAPI.deleteGroups(options, function(data) {
                    $scope.getUsers();
                }, function(data) {
                    alert($filter('translate')('error.deleteGroups'), data);
                });
            };

            /*
             * Update group rights
             * 
             * @param {string} collection_name
             * @param {string} right_name : create, download or visualize
             * @param {boolean} initial_value
             * @returns {undefined}
             */
            $scope.updateRight = function(collection_name, right_name, initial_value) {
                var options = [];

                if (initial_value === 0) {
                    initial_value = 1;
                } else {
                    initial_value = 0;
                }

                options[right_name] = initial_value;
                options['collection_name'] = collection_name;
                options['groupid'] = $scope.groupid;

                administrationAPI.updateGroupRights(options, function(data) {
                    $scope.rights = data.rights;
                }, function(data) {
                    alert($filter('translate')('error.updateRight'), data);
                });
            };

            /*
             * init the context
             */
            $scope.init = function() {
                /*
                 * Inform mainController that we are loading group section
                 */
                $scope.$emit('showGroup');
                $scope.groupid = $routeParams.groupid;
                $scope.getGroupsRights();
                $scope.getUsers();
                $scope.initCounter();
            };

            /*
             * init counter startindex and offset
             */
            $scope.initCounter = function() {
                $scope.offset = 0;
                $scope.limit = CONFIG.limit;
            };

            $scope.init();
        }
    }
    ;
})();
