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

    /* Controller Users */

    /*
     * profile :
     * 
     * {
     "userid": "2",
     "email": "toto",
     "groupname": "default",
     "username": "toto",
     "givenname": "toto",
     "lastname": "toto",
     "registrationdate": "2014-11-20T11:13:07Z",
     "activated": true,
     "lastsessionid": "vdqd28q0mv1pla7fdahkd40o07",
     "userhash": "f71dbe52628a3f83a77ab494817525c6"
     }
     */

    /*
     * rights :
     * 
     *  {
     "status": "success",
     "message": "Rights for 2",
     "userid": "2",
     "groupname": "default",
     "rights": {
     "*": {
     "search": true,
     "visualize": false,
     "download": false,
     "post": false,
     "put": false,
     "delete": false
     },
     "Spirit": {
     "features": {
     "68468087-b3d4-505e-bcc0-805f275795e8": {
     "delete": null,
     "put": null,
     "post": null,
     "visualize": null,
     "download": null,
     "search": null
     }
     },
     "delete": true,
     "put": true,
     "post": null,
     "visualize": true,
     "download": null,
     "search": null
     },
     ...
     }
     }
     *  
     */

    /*
     * User controller
     */

    angular.module('administration').controller('UserController', ['$scope', '$filter', 'administrationServices', '$location', '$routeParams', 'administrationAPI', 'CONFIG', userController]);

    function userController($scope, $filter, administrationServices, $location, $routeParams, administrationAPI, CONFIG) {

        if (administrationServices.isUserAnAdministrator()) {


            /*
             * Get filters from configuration
             */
            var arr = [''];
            $scope.methods = arr.concat(CONFIG.filters.methods);
            $scope.services = arr.concat(CONFIG.filters.services);
            $scope.collections = [];

            /*
             * List of templates path
             */
            $scope.templates =
                    {
                        'history': 'app/html/user/templates/history.html',
                        'rights': 'app/html/user/templates/rights.html',
                        'rightCreation': 'app/html/user/templates/rightCreation.html',
                        'signatures': 'app/html/user/templates/signatures.html',
                        'groups': 'app/html/user/templates/groups.html'
                    };

            /*
             * Init the context
             */
            $scope.init = function () {
                $scope.showRights = false;
                $scope.showHistory = false;
                $scope.showCreation = false;
                $scope.showSignatures = false;
                $scope.showGroups = false;

                $scope.history = [];
                $scope.feature = [];
                $scope.feature.collection = null;
                $scope.feature.search = false;
                $scope.feature.visualize = false;
                $scope.feature.download = false;
                $scope.feature.canput = false;
                $scope.feature.canpost = false;
                $scope.feature.candelete = false;
                $scope.feature.filters = null;

                $scope.ascOrDesc = 'DESC';
                $scope.orderBy = null;
                $scope.offset = 0;
                $scope.limit = CONFIG.limit;

                $scope.template = null;
            };

            $scope.initFilters = function () {
                $scope.ascOrDesc = 'DESC';
                $scope.orderBy = null;
                $scope.offset = 0;
                $scope.limit = CONFIG.limit;
            };

            /*
             * Set activation - depending on user activation state
             * 
             * If user isn't activated, this method activate user. Else, this method
             * deactivate user
             */
            $scope.activation = function () {
                if ($scope.selectedUser.activated === 1) {
                    administrationAPI.deactivateUser($scope.selectedUser.userid, function () {
                        $scope.initUser(function () {
                            $scope.getRights();
                        });
                    }, function () {
                        $scope.alert($filter('translate')('error.activation'));
                    });
                } else if ($scope.selectedUser.activated === 0) {
                    administrationAPI.activateUser($scope.selectedUser.userid, function () {
                        $scope.initUser(function () {
                            $scope.getRights();
                        });
                    }, function () {
                        $scope.alert($filter('translate')('error.activation'));
                    });
                } else {
                    $scope.alert($filter('translate')('error.activation'));
                }
            };

            $scope.validation = function () {
                if ($scope.selectedUser.validationdate !== null) {
                    administrationAPI.unvalidateUser($scope.selectedUser.userid, function () {
                        $scope.initUser(function () {
                            $scope.getRights();
                        });
                    }, function () {
                        $scope.alert($filter('translate')('error.validation'));
                    });
                } else {
                    administrationAPI.validateUser($scope.selectedUser.userid, function () {
                        $scope.initUser(function () {
                            $scope.getRights();
                        });
                    }, function () {
                        $scope.alert($filter('translate')('error.validation'));
                    });
                }
            };

            /*
             * Set user group - Switch between default and admin group
             */
            $scope.changeGroup = function () {
                if ($scope.selectedUser.groupname === 'default') {
                    $scope.setGroup('admin');
                } else if ($scope.selectedUser.groupname === 'admin') {
                    $scope.setGroup('default');
                }
            };


            /*
             * Set rights
             * 
             * @param {String} collection
             * @param {String} right - right you want change
             * @param {array} rights - rights values
             * 
             */
            $scope.setRight = function (collectionName, right, rights) {

                if (rights[right] === 1) {
                    rights[right] = 0;
                } else if (rights[right] === 0) {
                    rights[right] = 1;
                } else {
                    $scope.alert($filter('translate')('error.setRight'));
                    return;
                }

                var options = [];

                options.userid = $scope.selectedUser.userid;
                options.collection = collectionName;
                options.rights = rights;

                /*
                 * Set the new right
                 */
                administrationAPI.setRight(options, function () {
                    $scope.getRights();
                }, function (data) {
                    $scope.alert('Error : cannot set right', data);
                });
            };

            /*
             * Set group
             * 
             * @param {String} groupname
             * 
             */
            $scope.setGroup = function (groupname) {

                var options = [];
                options.userid = $scope.selectedUser.userid;
                options.email = $scope.selectedUser.email;
                options.groupname = groupname;

                /*
                 * Set the new group
                 */
                administrationAPI.setUserGroup(options, function () {
                    $scope.initUser(function () {
                        $scope.getRights();
                    });
                });
            };

            /*
             * Display history
             */
            $scope.displayHistory = function () {
                $scope.init();
                $scope.initFilters();
                $scope.getHistory();
                $scope.template = $scope.templates.history;
                $scope.showHistory = true;
            };

            /*
             * Display rights
             */
            $scope.displayRights = function () {
                $scope.init();
                $scope.getRights();
                $scope.getSignatures();
                $scope.template = $scope.templates.rights;
                $scope.showRights = true;
            };

            /*
             * Display signatures
             */
            $scope.displaySignatures = function () {
                $scope.init();
                $scope.getSignatures();
                $scope.template = $scope.templates.signatures;
                $scope.showSignatures = true;
            };

            /*
             * Display groups
             */
            $scope.displayGroups = function () {
                $scope.newGroup = null;
                $scope.init();
                $scope.getGroups();
                $scope.listGroups();
                $scope.template = $scope.templates.groups;
                $scope.newGroup = '';
                $scope.showGroups = true;
            };

            /*
             * go to history
             */
            $scope.goToHistory = function () {
                var path = '/users/' + $scope.selectedUser.userid + '/history';
                $location.path(path, false);
                $scope.displayHistory();
            };

            /*
             * go to rights
             */
            $scope.goToRights = function () {
                var path = '/users/' + $scope.selectedUser.userid;
                $location.path(path, false);
                $scope.displayRights();
            };

            /*
             * go to signatures
             */
            $scope.goToSignatures = function () {
                var path = '/users/' + $scope.selectedUser.userid + '/signatures';
                $location.path(path, false);
                $scope.displaySignatures();
            };

            /*
             * go to groups
             */
            $scope.goToGroups = function () {
                var path = '/users/' + $routeParams.userid + '/groups';
                $location.path(path, false);
                $scope.displayGroups();
            };

            /*
             * go to advanced rights
             */
            $scope.goToAdvancedRights = function () {
                var path = '/users/' + $scope.selectedUser.userid + '/rights';
                $location.path(path, false);
                $scope.displayCreateAdvancedRights();
            };

            /*
             * Set collection
             * 
             * @param {String} collection
             * 
             */
            $scope.setCollection = function (collection) {
                $scope.feature.collection = collection;
            };

            /*
             * Display create advanced rights
             */
            $scope.displayCreateAdvancedRights = function () {
                $scope.init();
                $scope.template = $scope.templates.rightCreation;
                $scope.showCreation = true;
            };

            /*
             * Delete advanced right
             * 
             * @param {String} collection
             * @param {String} featureid
             * 
             */
            $scope.deleteAdvancedRight = function (collection, featureid) {

                var x = confirm("Delete right ?");
                if (x)
                    $scope.deleteAdvancedRightConfirmed(collection, featureid);
            };

            /*
             * Delete advanced right
             * 
             * @param {String} collection
             * @param {String} featureid
             * 
             */
            $scope.deleteAdvancedRightConfirmed = function (collection, featureid) {

                var options = [];
                options.collection = collection;
                options.featureid = featureid;
                options.userid = $scope.selectedUser.userid;
                options.email = $scope.selectedUser.email;

                administrationAPI.deleteRight(options, function () {
                    $scope.getRights();
                });
            };

            /*
             * Delete rights
             * 
             * @param {String} collection
             * 
             */
            $scope.deleteRightsConfirmed = function (collection) {

                var options = [];
                options.collection = collection;
                options.userid = $scope.selectedUser.userid;
                options.email = $scope.selectedUser.email;

                administrationAPI.deleteRight(options, function () {
                    $scope.getRights();
                }, function (data) {
                    $scope.alert($filter('translate')('error.deleteRight'), data);
                });
            };

            /*
             * Set right
             * 
             * @param {String} collection
             * @param {String} right
             * @param {boolean} value
             * 
             */
            $scope.deleteRights = function (collection) {

                var x = confirm("Reset rights ?");
                if (x)
                    $scope.deleteRightsConfirmed(collection);

            };

            /*
             * Get user
             */
            $scope.initUser = function (callback) {
                administrationAPI.getUser($routeParams.userid, function (data) {
                    $scope.selectedUser = data;
                    callback();
                });
            };

            /*
             * Get rights
             */
            $scope.getRights = function () {
                administrationAPI.getRight($routeParams.userid, function (data) {
                    $scope.rights = data;
                });
            };

            /*
             * Get signatures
             */
            $scope.getSignatures = function () {
                administrationAPI.getSignatures($routeParams.userid, function (data) {
                    $scope.signatures = data;
                });
            };

            /*
             * Set history 
             * 
             * @param {String} orderBy
             * 
             */
            $scope.setHistory = function (orderBy) {

                $scope.limit = CONFIG.limit;
                $scope.offset = 0;

                if ($scope.ascOrDesc === 'DESC') {
                    $scope.ascOrDesc = 'ASC';
                } else {
                    $scope.ascOrDesc = 'DESC';
                }

                $scope.orderBy = orderBy;
                $scope.getHistory(false);
            };

            /**
             * Get history
             * 
             * If concatData is true, the existing data is concataned with new data,
             * else, existing data is deleted.
             * 
             * @param {type} concatData
             * 
             */
            $scope.getHistory = function (concatData) {

                var options = [];
                options.limit = $scope.limit;
                options.offset = $scope.offset;
                options.ascordesc = $scope.ascOrDesc;
                options.orderby = $scope.orderBy;
                options.userid = $routeParams.userid;
                options.collection = $scope.selectedCollection;
                options.method = $scope.selectedMethod;
                options.service = $scope.selectedService;
                options.email = $scope.selectedUser.email;

                administrationAPI.getHistory(options, function (data) {
                    $scope.offset = $scope.offset + $scope.limit;
                    if (concatData === false) {
                        $scope.history = data;
                    } else {
                        $scope.history = $scope.history.concat(data);
                    }
                    /*
                     * If no data, do not increment offset
                     */
                    if (!data[0]) {
                        $scope.offset = $scope.offset - $scope.limit;
                    }
                }, function (data) {
                    $scope.alert('Error cannot get history', data);
                });
            };

            $scope.setParam = function (type, value) {
                $scope.initFilters();

                if (type === 'method') {
                    $scope.selectedMethod = value;
                } else if (type === 'service') {
                    $scope.selectedService = value;
                } else if (type === 'collection') {
                    $scope.selectedCollection = value;
                }

                $scope.getHistory(false);
            };

            $scope.resetFilters = function () {
                $scope.selectedService = null;
                $scope.selectedCollection = null;
                $scope.selectedMethod = null;
                $scope.collection = null;

                $scope.initFilters();
                $scope.getHistory(false);
            };

            /*
             * Call by infinite scroll
             */
            $scope.loadMore = function () {
                $scope.getHistory(true);
            };

            /**
             * Get collections
             * 
             * @returns {undefined}
             */
            $scope.getCollections = function () {
                administrationAPI.getCollections(function (data) {
                    $scope.collections.push('');
                    for (var c in data) {
                        $scope.collections.push(data[c].name);
                    }
                }, function () {
                    alert($filter('translate')('error.setCollections'));
                });
            };

            /**
             * Get user groups
             */
            $scope.getGroups = function () {

                var options = [];
                options.userid = $routeParams.userid;

                administrationAPI.getGroups(options, function (data) {
                    $scope.groups = $scope.formatGroups(data);
                }, function (data) {
                    $scope.alert($filter('translate')('error.getGroups'), data);
                });
            };

            /**
             * List all groups 
             * 
             * @returns {undefined}
             */
            $scope.listGroups = function () {
                administrationAPI.getGroups([], function (data) {
                    $scope.groupsList = data;
                }, function (data) {
                    $scope.alert($filter('translate')('error.getGroups'), data);
                });
            };

            /**
             * Add groups to user groups
             * 
             * @param {Array} groups 
             * @returns {undefined}
             */
            $scope.addGroups = function (groups) {

                var options = [];
                options.groups = groups;
                options.userid = $routeParams.userid;

                administrationAPI.addGroups(options, function (data) {
                    $scope.groups = $scope.formatGroups(data);
                }, function (data) {
                    $scope.alert($filter('translate')('error.addGroups'), data);
                });
            };

            /**
             * Delete groups from user groups
             * 
             * @param {Array} groups 
             * @returns {undefined}
             */
            $scope.deleteGroup = function (groups) {

                var options = [];
                options.groups = groups;
                options.userid = $routeParams.userid;

                administrationAPI.deleteGroups(options, function (data) {
                    $scope.groups = $scope.formatGroups(data);
                }, function (data) {
                    $scope.alert($filter('translate')('error.deleteGroups'), data);
                });
            };


            /*
             * Format groups.
             * 
             * RESTo returns groups in a string formated. This function
             * creates an array from this string.
             */
            $scope.formatGroups = function (data) {
                if (data && data !== '') {
                    return data.split(',');
                } else {
                    return null;
                }
            };

            /**
             * Alert - display error/warning message
             * 
             * @param {string} message
             * @param {string} data
             */
            $scope.alert = function (message, data) {
                var printed_message = message + ((typeof data === 'undefined') ? '' : ' - details : ' + (data.ErrorMessage ? data.ErrorMessage : data));
                alert(printed_message);
            };

            /*
             * Inform mainController that we are in user part
             */
            $scope.$emit('showUser');

            $scope.init();
            $scope.initUser(function () {

                /*
                 * By default, display rights section
                 */
                $scope.displayRights();
                $scope.getCollections();

                /*
                 * Set section by watching route params
                 */
                if ($routeParams.section === 'history') {
                    $scope.displayHistory();
                } else if ($routeParams.section === 'signatures') {
                    $scope.displaySignatures();
                } else if ($routeParams.section === 'rights') {
                    $scope.displayCreateAdvancedRights();
                } else if ($routeParams.section === 'groups') {
                    $scope.displayGroups();
                }

            });
        }
    }
})();

