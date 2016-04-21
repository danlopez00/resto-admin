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
     Created on : 06 mai 2015, 10:27:08
     Author     : remi.mourembles@capgemini.com
     */

    angular.module('administration')
            .factory('administrationAPI', ['$http', 'CONFIG', administrationAPI]);
    function administrationAPI($http, config) {

        var api = {
            activateUser: activateUser,
            addGroups: addGroups,
            addUser: addUser,
            createGroup: createGroup,
            deleteGroups: deleteGroups,
            deactivateUser: deactivateUser,
            deleteRight: deleteRight,
            getCollections: getCollections,
            getCollectionsStats: getCollectionsStats,
            getHistory: getHistory,
            getGroups: getGroups,
            getGroupsRights: getGroupsRights,
            getGroupUsers: getGroupUsers,
            getRight: getRight,
            getSignatures: getSignatures,
            getUser: getUser,
            getUsers: getUsers,
            getUsersStats: getUsersStats,
            searchProducts: searchProducts,
            setAdvancedRight: setAdvancedRight,
            setCollectionRight: setCollectionRight,
            setRight: setRight,
            setUserGroup: setUserGroup,
            updateGroupRights: updateGroupRights,
            unvalidateUser: unvalidateUser,
            validateUser: validateUser
        };
        return api;
        /////////

        /**
         * Get history 
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getHistory(options, callback, error) {

            var limit = options.limit;
            var offset = options.offset;
            var ascordesc = options.ascordesc;
            var orderby = options.orderby;
            var email = options.email;
            var method = options.method;
            var service = options.service;
            var maxDate = options.maxdate;
            var minDate = options.mindate;
            var collection = options.collection;

            var url = config.restoServerUrl + config.administrationEndpoint;
            url = url + '/history.json?_offset=' + offset + '&_limit=' + limit;

            if (email) {
                url = url + "&_email=" + email;
            }
            if (ascordesc) {
                url = url + "&_ascordesc=" + ascordesc;
            }
            if (orderby) {
                url = url + "&_order=" + orderby;
            }
            if (method) {
                url = url + "&_method=" + method;
            }
            if (service) {
                url = url + "&_service=" + service;
            }
            if (maxDate) {
                url = url + "&_maxdate=" + maxDate;
            }
            if (minDate) {
                url = url + "&_mindate=" + minDate;
            }
            if (collection) {
                url = url + "&_collection=" + collection;
            }


            $http.get(url)
                    .success(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            callback(data.history);
                        }
                    })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get history');
                        }
                    });
        }

        /**
         * Get list of collections
         * 
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getCollections(callback, error) {
            // /administration/collections.json

            $http({
                method: 'GET',
                cache: true,
                url: config.restoServerUrl + '/collections.json'
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data.collections);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - get collections failed');
                }
            });
        }

        /**
         * Set a right for specified collection
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function setCollectionRight(options, callback, error) {

            var emailorgroup = options.emailorgroup;
            var collection = options.collection;
            var field = options.field;
            var value = options.value;

            $http({
                method: 'POST',
                // /administration/collections
                url: config.restoServerUrl + config.administrationEndpoint + '/collections',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    emailorgroup: emailorgroup,
                    collection: collection,
                    field: field,
                    value: value
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - set collection right');
                }
            });
        }

        /**
         * Get stats
         * 
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getCollectionsStats(callback, error) {
            // /administration/stats/collections.json
            var url = config.restoServerUrl + config.administrationEndpoint + '/stats/collections.json';


            $http({
                method: 'GET',
                url: url
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - get stats failed');
                }
            });
        }

        /**
         * Get users list
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getUsers(options, callback, error) {

            $http({
                method: 'GET',
                url: config.restoServerUrl + config.administrationEndpoint + '/users.json',
                params: {
                    offset: options.offset,
                    limit: options.limit,
                    keywords: options.keyword
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data.profiles);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - get users');
                }
            });
        }

        /**
         * Get users stats
         * 
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getUsersStats(callback, error) {
            // administration/stats/users.json
            var url = config.restoServerUrl + config.administrationEndpoint + '/stats/users.json';

            $http.get(url)
                    .success(
                            function (data) {
                                if (data.ErrorMessage) {
                                    error(data);
                                } else {
                                    callback(data);
                                }
                            })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get stats');
                        }
                    });
        }

        /**
         * Add new user
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function addUser(options, callback, error) {

            $http({
                method: 'POST',
                url: config.restoServerUrl + config.administrationEndpoint + '/users',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    email: options.email,
                    password: options.password,
                    username: options.username,
                    givename: options.givename,
                    lastname: options.lastname
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                error(data);
            });
        }

        /**
         * Get user profile
         * 
         * @param {integer} userid
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getUser(userid, callback, error) {

            $http.get(config.restoServerUrl + '/' + config.administrationEndpoint + '/users/' + userid + '.json')
                    .success(
                            function (data) {
                                if (data.ErrorMessage) {
                                    error(data);
                                } else {
                                    callback(data.profile);
                                }
                            })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get user');
                        }
                    });
        }

        /**
         * Activate user
         * 
         * @param {integer} userid
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function activateUser(userid, callback, error) {
            $http({
                method: 'PUT',
                url: config.restoServerUrl + config.administrationEndpoint + "/users/" + userid + "/activate"
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - activate user');
                }
            });
        }

        /**
         * Deactivate user
         * 
         * @param {integer} userid
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function deactivateUser(userid, callback, error) {
            $http({
                method: 'PUT',
                url: config.restoServerUrl + config.administrationEndpoint + "/users/" + userid + "/deactivate"
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - deactivate user');
                }
            });
        }

        /**
         * Validate user
         * 
         * @param {type} userid
         * @param {type} callback
         * @param {type} error
         * @returns {undefined}
         */
        function validateUser(userid, callback, error) {
            $http({
                method: 'PUT',
                url: config.restoServerUrl + config.administrationEndpoint + "/users/" + userid + "/validate"
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - validate user');
                }
            });
        }

        /**
         * Unvalidate user
         * 
         * @param {type} userid
         * @param {type} callback
         * @param {type} error
         * @returns {undefined}
         */
        function unvalidateUser(userid, callback, error) {
            $http({
                method: 'PUT',
                url: config.restoServerUrl + config.administrationEndpoint + "/users/" + userid + "/unvalidate"
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - unvalidate user');
                }
            });
        }

        /**
         * Set user group
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function setUserGroup(options, callback, error) {

            var userid = options.userid;
            var email = options.email;
            var groupname = options.groupname;

            $http({
                method: 'POST',
                url: config.restoServerUrl + config.administrationEndpoint + '/users/' + userid,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    email: email,
                    groupname: groupname
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - set group');
                }
            });
        }

        /**
         * Get signatures
         * 
         * @param {integer} userid
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getSignatures(userid, callback, error) {
            $http.get(config.restoServerUrl + config.administrationEndpoint + '/users/' + userid + '/signatures')
                    .success(
                            function (data) {
                                if (data.ErrorMessage) {
                                    error(data);
                                } else {
                                    callback(data.signatures);
                                }
                            })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get signatures');
                        }
                    });
        }

        /**
         * Get gorups rights
         * 
         * @param {string} groupid
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getGroupsRights(groupid, callback, error) {
            $http.get(config.restoServerUrl + config.administrationEndpoint + '/groups/' + groupid + '/rights.json')
                    .success(
                            function (data) {
                                if (data.ErrorMessage) {
                                    error(data);
                                } else {
                                    callback(data);
                                }
                            })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get groups rights');
                        }
                    });
        }

        function updateGroupRights(options, callback, error) {

            var rights = {};

            /*
             * Check what right is set
             */
            if (typeof options.create !== "undefined") {
                rights.create = options.create;
            }
            if (typeof options.visualize !== "undefined") {
                rights.visualize = options.visualize;
            }
            if (typeof options.download !== "undefined") {
                rights.download = options.download;
            }

            /*
             * Request the server
             */
            $http({
                method: 'PUT',
                url: config.restoServerUrl + config.administrationEndpoint + '/groups/' + options.groupid + '/rights',
                dataType: "json",
                data: {
                    rights: rights,
                    target: options.collection_name,
                    targetType: 'collection'
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('Undefined error');
                }
            });
        }

        /**
         * Get rights
         * 
         * @param {string} userid
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getRight(userid, callback, error) {
            $http.get(config.restoServerUrl + config.administrationEndpoint + '/users/' + userid + '/rights.json')
                    .success(
                            function (data) {
                                if (data.ErrorMessage) {
                                    error(data);
                                } else {
                                    callback(data.rights);
                                }
                            })
                    .error(function (data) {
                        if (data.ErrorMessage) {
                            error(data);
                        } else {
                            error('error - get rights');
                        }
                    });
        }

        /**
         * Delete right
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function deleteRight(options, callback, error) {

            var url = config.restoServerUrl + config.administrationEndpoint + '/users/' + options.userid + '/rights/' + options.collection;

            if (options.featureid) {
                url = url + '/' + options.featureid;
            }

            $http({
                method: 'DELETE',
                url: url,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data.ErrorMessage);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - delete right');
                }
            });
        }

        /**
         * Set right
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function setRight(options, callback, error) {

            var userid = options.userid;
            var collection = options.collection;
            var rights = options.rights;

            $http({
                method: 'POST',
                url: config.restoServerUrl + config.administrationEndpoint + '/users/' + userid + '/rights/' + collection,
                dataType: "json",
                data: {
                    rights: rights
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('Undefined error');
                }
            });
        }

        /**
         * Set advanced right
         * 
         * @param {array} options
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function setAdvancedRight(options, callback, error) {

            var userid = options.userid;
            var emailorgroup = options.emailorgroup;
            var collection = options.collection;
            var featureid = options.featureid;
            var search = options.search;
            var visualize = options.visualize;
            var download = options.download;
            var canput = options.canput;
            var canpost = options.canpost;
            var candelete = options.candelete;
            var filters = options.filters;

            $http({
                method: 'POST',
                url: config.restoServerUrl + config.administrationEndpoint + '/users/' + userid + '/rights',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    emailorgroup: emailorgroup,
                    collection: collection,
                    featureid: featureid,
                    search: search,
                    visualize: visualize,
                    download: download,
                    canput: canput,
                    canpost: canpost,
                    candelete: candelete,
                    filters: filters
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data);
                }
            }).error(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    error('error - set advanced right');
                }
            });
        }

        /**
         * Delete groups
         * 
         * @param {array} options : must contains userid and groups
         * @param {function} callback : called in case of success
         * @param {function} error : called in case of error
         * @returns {undefined}
         */
        function deleteGroups(options, callback, error) {
            if (!options.groups || !options.userid) {
                error('groups or userid are missing');
            } else {
                $http({
                    method: 'DELETE',
                    url: config.restoServerUrl + config.administrationEndpoint + '/users/' + options.userid + '/groups/' + options.groups
                }).success(function (data) {
                    if (data.ErrorMessage) {
                        error(data);
                    } else {
                        callback(data.groups);
                    }
                }).error(function (data) {
                    error(data);
                });
            }
        }

        /**
         * Show {userid} groups
         * 
         * @param {array} options : must contains userid
         * @param {function} callback : called in case of success
         * @param {function} error : called in case of error
         * @returns {undefined}
         */
        function getGroups(options, callback, error) {
            var cache = false;
            var url = config.restoServerUrl + '/' + config.administrationEndpoint + '/users/';
            if (options.userid) {
                url = url + options.userid;
                cache = false;
            }

            url = url + '/groups';

            $http({
                method: 'GET',
                cache: cache,
                url: url,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data.groups);
                }
            }).error(function (data) {
                error(data);
            });
        }

        /**
         * Show group users
         * 
         * @param {array} options : contains groupid, offset, limit
         * @param {function} callback : called in case of success
         * @param {function} error : called in case of error
         * @returns {undefined}
         */
        function getGroupUsers(options, callback, error) {
            var groupid = options.groupid;


            var url = config.restoServerUrl + '/' + config.administrationEndpoint + '/groups/' + groupid + '/users';

            $http({
                method: 'GET',
                url: url,
                params: {
                    limit: options.limit,
                    offset: options.offset
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data.users);
                }
            }).error(function (data) {
                error(data);
            });
        }

        /**
         * Create group
         * 
         * @param {string} groupid
         * @param {function} callback : called in case of success
         * @param {function} error : called in case of error
         * @returns {undefined}
         */
        function createGroup(groupid, callback, error) {
            $http({
                method: 'POST',
                url: config.restoServerUrl + config.administrationEndpoint + '/groups',
                data: {
                    groupid: groupid
                }
            }).success(function (data) {
                if (data.ErrorMessage) {
                    error(data);
                } else {
                    callback(data.groups);
                }
            }).error(function (data) {
                error(data);
            });
        }

        /**
         * Add groups
         * 
         * @param {array} options : must contains userid and groups
         * @param {function} callback : called in case of success
         * @param {function} error : called in case of error
         * @returns {undefined}
         */
        function addGroups(options, callback, error) {
            if (!options.groups || !options.userid) {
                error('groups or userid are missing');
            } else {
                $http({
                    method: 'PUT',
                    url: config.restoServerUrl + config.administrationEndpoint + '/users/' + options.userid + '/groups/',
                    data: {
                        groups: options.groups.groupid
                    }
                }).success(function (data) {
                    if (data.ErrorMessage) {
                        error(data);
                    } else {
                        callback(data.groups);
                    }
                }).error(function (data) {
                    error(data);
                });
            }
        }

        /**
         * 
         * Search in all collections
         * 
         * GET /api/collections/search
         * 
         * @param {array} params
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function searchProducts(params, callback, error) {

            /*
             * Clean params
             */
            var searchParams = {
                q: params.q || '',
                page: params.page || 1,
                lang: 'en'
            };
            for (var key in params) {
                if (key !== 'view' && key !== 'collection' && typeof params[key] !== 'undefined') {
                    searchParams[key] = params[key];
                }
            }
            $http({
                url: config.restoServerUrl + '/api/collections' + (params.collection ? '/' + params.collection : '') + '/search.json',
                method: 'GET',
                params: searchParams
            }).
                    success(function (result) {
                        callback(result);
                    }).
                    error(function (result) {
                        error(result);
                    });
        }
    }
})();
