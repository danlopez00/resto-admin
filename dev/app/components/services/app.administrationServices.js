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
     Created on : 6 mai 2015, 10:27:08
     Author     : remi.mourembles@capgemini.com
     */

    angular.module('administration')
            .factory('administrationServices', ['$auth', administrationServices]);

    function administrationServices($auth) {

        var api = {
            getToken: getToken,
            isUserAnAdministrator: isUserAnAdministrator,
            download: download
        };

        return api;

        /////////

        /**
         * Check if current user is an administrator
         * @returns {Boolean}
         */
        function isUserAnAdministrator() {
            if ($auth.isAuthenticated() && $auth.getPayload().data.groups.indexOf("admin") > -1) {
                return true;
            } else {
                return false;
            }

        }

        /**
         * Returns a JWT from Local Storage
         */
        function getToken() {
            return $auth.getToken();
        }

        /**
         * Automatically open iframe within page for download
         * (Note: systematically add a _bearer query parameter for authentication)
         * 
         * @param {String} url
         */
        function download(url) {

            var $frame = $('#hiddenDownloader');

            /*
             * Add authentication bearer
             */
            url = url + (url.indexOf('?') === -1 ? '?' : '&') + '_bearer=' + getToken();

            if ($frame.length === 0) {
                $frame = $('<iframe id="hiddenDownloader" style="display:none;">').appendTo('body');
            }
            $frame.attr('src', url).load(function (data) {
                var result = JSON.parse($('body', $(this).contents()).text());
                if (result && result.ErrorCode) {
                    switch (result.ErrorCode) {
                        case 3002:
                            error('ERROR');
                            break;
                        case 403:
                            error('Forbidden');
                            break;
                        case 404:
                            error('Not found');
                            break;
                        default:
                            error('Problem downloading');
                    }
                }
            });
            return false;
        }
    }
})();
