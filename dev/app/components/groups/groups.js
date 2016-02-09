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
     Author     : remi.mourembles@capgemini.com
     */

    /* Controller Groups */


    angular.module('administration').controller('GroupsController', ['$scope', '$filter', 'administrationServices', '$location', 'administrationAPI', 'CONFIG', groupsController]);

    function groupsController($scope, $filter, administrationServices, $location, administrationAPI, CONFIG) {

        if (administrationServices.isUserAnAdministrator()) {

            /**
             * Get user groups
             */
            $scope.getGroups = function () {

                var options = [];

                administrationAPI.getGroups(options, function (data) {
                    $scope.groups = data;
                }, function (data) {
                    $scope.alert($filter('translate')('error.getGroups'), data);
                });
            };

            /**
             * Select group
             * 
             * @param {String} groupid
             * 
             */
            $scope.selectGroup = function (group) {
                $scope.init();
                $location.path($location.path() + '/' + group.groupid);
            };

            $scope.createGroup = function (groupid) {
                administrationAPI.createGroup(groupid, function (data) {
                    $scope.groups = data;
                }, function (data) {
                    $scope.alert($filter('translate')('error.createGroups'), data);
                });
            };

            /*
             * Inform mainController that we are loading groups section
             */
            $scope.$emit('showGroups');
            $scope.getGroups();
        }
    }
})();
