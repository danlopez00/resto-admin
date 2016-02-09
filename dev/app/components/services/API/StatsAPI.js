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
     Created on : 06 january 2016, 10:27:08
     Author     : remi.mourembles@capgemini.com
     */

    angular.module('administration')
            .factory('statsAPI', ['$http', 'CONFIG', statsAPI]);
    function statsAPI($http, config) {

        var api = {
            getCount: getCount,
            getLogsCountsByMonth: getLogsCountsByMonth,
            getLogsCountsByRecentMonth: getLogsCountsByRecentMonth,
            getUsersWorldGeometry: getUsersWorldGeometry
        };
        return api;
        /////////

        /**
         * Get users number by field
         * 
         * @param {string} field
         * @param {method} callback
         * @param {method} error
         * @returns {undefined}
         */
        function getCount(field, callback, error) {

            /*
             * Construct URL
             */
            var url = config.restoServerUrl + config.statistics.statsEndpoint;
            url = url + '/users/count/' + field;

            $http.get(url)
                    .success(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            callback(data.counts);
                        }
                    })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get users count');
                        }
                    });
        }

        /**
         * Get logs number by month and by service
         * 
         * @param {string} service
         * @param {method} callback
         * @param {method} error
         * @returns {undefined}
         */
        function getLogsCountsByMonth(service, callback, error) {

            var url = config.restoServerUrl + config.statistics.statsEndpoint;
            url = url + '/' + service;

            $http.get(url)
                    .success(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            callback(data[service]);
                        }
                    })
                    .error(function (data) {
                        if (data && data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get users count');
                        }
                    });
        }

        /**
         * Get logs number by month and by service for recent months
         * 
         * @param {string} service
         * @param {method} callback
         * @param {method} error
         * @returns {undefined}
         */
        function getLogsCountsByRecentMonth(service, callback, error) {

            var url = config.restoServerUrl + config.statistics.statsEndpoint;
            url = url + '/' + service + '/recent';

            $http.get(url)
                    .success(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            callback(data[service]);
                        }
                    })
                    .error(function (data) {
                        if (data && data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get users count');
                        }
                    });
        }

        /**
         * Get users number by countries. For each country get geometry
         * 
         * @param {method} callback
         * @param {method} error
         * @returns {undefined}
         */
        function getUsersWorldGeometry(callback, error) {
            var url = config.restoServerUrl + config.statistics.statsEndpoint;
            url = url + '/users/countries/geometry';

            $http.get(url)
                    .success(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            callback(data);
                        }
                    })
                    .error(function (data) {
                        if (data && data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get users count');
                        }
                    });
        }
    }
})();
