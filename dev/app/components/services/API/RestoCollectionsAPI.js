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
     Created on : 15 septembre 2015, 09:41:08
     Author     : remi.mourembles@capgemini.com
     */

    angular.module('administration')
            .factory('restoCollectionsAPI', ['$http', 'CONFIG', restoCollectionsAPI]);

    function restoCollectionsAPI($http, config) {

        var api = {
            getCollection: getCollection,
            getCollections: getCollections,
            getItems: getItems,
            deleteCollection: deleteCollection,
            deleteItem: deleteItem,
            postCollection: postCollection,
            postItem: postItem
        };

        return api;

        /////////

        /*
         * Get collections
         * 
         * @param {type} callback
         * @param {type} error
         * @returns {undefined}
         */
        function getCollections(callback, error) {
            /*
             * Call RESTo api
             */
            $http({
                method: 'GET',
                url: config.restoServerUrl + '/collections'
            }).success(function (data) {
                if (data.collections) {
                    callback(data.collections);
                } else {
                    error();
                }
            }).error(function () {
                error();
            });

        }

        /*
         * Get collection description
         * 
         * @param {string} collectionName
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getCollection(collectionName, callback, error) {
            /*
             * Call RESTo api
             */
            $http({
                method: 'GET',
                url: config.restoServerUrl + '/collections/' + collectionName
            }).success(function (data) {
                if (data) {
                    callback(data);
                } else {
                    error();
                }
            }).error(function () {
                error();
            });
        }

        /*
         * Get items
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getItems(options, callback, error) {
            /*
             * Call RESTo api
             */
            $http({
                method: 'GET',
                url: config.restoServerUrl + '/api/collections/' + options.collectionName + '/search.json',
                params: {
                    page: options.page
                }
            }).success(function (data) {
                if (data) {
                    callback(data);
                } else {
                    error();
                }
            }).error(function () {
                error();
            });

        }

        function deleteCollection(collectionName, callback, error) {
            /*
             * Call RESTo api
             */
            $http({
                method: 'DELETE',
                url: config.restoServerUrl + '/collections/' + collectionName
            }).success(function () {
                callback();
            }).error(function (data) {
                error(data.message);
            });
        }

        /*
         * Delete item
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function deleteItem(options, callback, error) {
            if (!options.collectionName || !options.featureIdentifier) {
                error('missing attributes');
            }
            /*
             * Call RESTo api
             */
            $http({
                method: 'DELETE',
                url: config.restoServerUrl + '/collections/' + options.collectionName + '/' + options.featureIdentifier
            }).success(function () {
                callback();
            }).error(function (data) {
                error(data);
            });
        }

        function postCollection() {
            // TODO
        }

        function postItem() {
            // TODO
        }

    }
})();
