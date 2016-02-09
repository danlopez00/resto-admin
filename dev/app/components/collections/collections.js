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

    /* Controller Collections */


    angular.module('administration').controller('CollectionsController', ['$scope', '$location', 'administrationServices', 'restoCollectionsAPI', collectionsController]);

    function collectionsController($scope, $location, administrationServices, restoCollectionsAPI) {

        if (administrationServices.isUserAnAdministrator()) {

            $scope.getCollections = function () {
                restoCollectionsAPI.getCollections(function (data) {
                    $scope.collections = data;
                }, function (data) {
                    alert($filter('translate')('error.getCollections'));
                });
            };

            $scope.selectCollection = function (collectionName) {
                $scope.init();
                $location.path($location.path() + '/' + collectionName);
            };

            /*
             * Init the context
             */
            $scope.init = function () {
                $scope.busy = true;
                $scope.getCollections();
                $scope.$emit('showCollections');
            };

            $scope.init();
        }
    }
})();