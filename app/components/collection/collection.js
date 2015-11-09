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

    /* Controller Collection */


    angular.module('administration').controller('CollectionController', ['$scope', '$routeParams', '$filter', 'administrationServices', 'restoCollectionsAPI', collectionController]);

    function collectionController($scope, $routeParams, $filter, administrationServices, restoCollectionsAPI) {

        if (administrationServices.isUserAnAdministrator()) {

            /*
             * Get collection description
             * 
             * @param {string} collectionName
             * @returns {undefined}
             */
            $scope.getCollection = function(collectionName) {
                restoCollectionsAPI.getCollection(collectionName, function(data) {
                    $scope.collection = data;
                    $scope.ready = true;
                }, function(data) {
                    alert($filter('translate')('error.getCollections'));
                });
            };

            /*
             * Get items
             * 
             * @param {boolean} concatData
             * @returns {undefined}
             */
            $scope.getItems = function(concatData) {

                var options = [];
                options['collectionName'] = $routeParams.collectionname;
                options['page'] = $scope.page;

                restoCollectionsAPI.getItems(options, function(data) {
                    $scope.page = $scope.page + 1;
                    if (concatData === false) {
                        $scope.features = data.features;
                    } else {
                        $scope.features = $scope.features.concat(data.features);
                    }

                    if (data.properties.totalResults === 0) {
                        $scope.page = $scope.page - 1;
                    }
                }, function() {
                    alert($filter('translate')('error.getItems'));
                });
            };

            /*
             * Delete feature
             * 
             * @param {integer} featureIdentifier
             * @returns {undefined}
             */
            $scope.deleteFeature = function(featureIdentifier) {
                var x = confirm($filter('translate')('Delete feature ?'));
                if (x) {
                    var options = [];
                    options.collectionName = $routeParams.collectionname;
                    options.featureIdentifier = featureIdentifier;
                    restoCollectionsAPI.deleteItem(options, function() {
                        $scope.page = 1;
                        $scope.getItems(false);
                    }, function(data) {
                        alert($filter('translate')('error.deleteFeature') + data.ErrorMessage);
                    });
                }
            };

            /**
             * Call to load more data
             * 
             * @returns {undefined}
             */
            $scope.loadMore = function() {
                $scope.getItems(true);
            };

            /*
             * Init the context
             */
            $scope.init = function() {
                $scope.ready = false;
                $scope.features = [];
                $scope.busy = true;
                $scope.page = 1;
                $scope.getCollection($routeParams.collectionname);
                $scope.getItems(false);
                $scope.$emit('showCollection');
            };

            $scope.init();
        }
    }
    ;
})();