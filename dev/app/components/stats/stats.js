(function (window) {

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

    angular.module('administration').controller('StatsController', [
        '$scope',
        'administrationServices',
        'statsAPI',
        '$timeout',
        'CONFIG',
        'restoCollectionsAPI',
        'Flash',
        historyController
    ]);

    function historyController($scope,
            administrationServices,
            statsAPI,
            $timeout,
            CONFIG,
            restoCollectionsAPI,
            Flash) {

        (function (ol) {

            if (administrationServices.isUserAnAdministrator()) {

                $scope.error = [];
                $scope.stats = [];
                $scope.chart = [];
                $scope.maps = [];
                $scope.feat = [];
                $scope.products = [];
                $scope.downloadableLinks = [];
                $scope.params = {};
                $scope.restoServerUrl = CONFIG.restoServerUrl;

                // Available colors for maps
                var colorCodes = ['#E6E6E6', '#D8D8D8', '#BDBDBD', '#A4A4A4', '#848484', '#6E6E6E', '#585858', '#424242', '#2E2E2E', '#000000'];

                /**
                 * Init a map
                 * 
                 * @param {string} identifier : unique identifier
                 * @returns {undefined}
                 */
                $scope.initMap = function (identifier, loader) {

                    var styleMap = new window.ol.style.Style({
                        fill: new window.ol.style.Fill({
                            color: '#fff'
                        }),
                        stroke: new window.ol.style.Stroke({
                            color: '#319FD3',
                            width: 0.5
                        }),
                        text: new window.ol.style.Text({
                            font: '12px Calibri,sans-serif',
                            fill: new window.ol.style.Fill({
                                color: '#000'
                            }),
                            stroke: new window.ol.style.Stroke({
                                color: '#fff',
                                width: 3
                            })
                        })
                    });
                    var stylesMap = [styleMap];

                    var vectorMap = new window.ol.layer.Vector({
                        source: new window.ol.source.Vector({
                            // TODO : change this by a configurable way
                            url: 'data/countries.geojson',
                            format: new window.ol.format.GeoJSON()
                        }),
                        style: function (feature, resolution) {
                            //styleMap.getText().setText(resolution < 5000 ? feature.get('name') : '');
                            return stylesMap;
                        }
                    });

                    var style = new window.ol.style.Style({
                        fill: new window.ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.6)'
                        }),
                        stroke: new window.ol.style.Stroke({
                            color: '#319FD3',
                            width: 1
                        }),
                        text: new window.ol.style.Text({
                            font: '12px Calibri,sans-serif',
                            fill: new window.ol.style.Fill({
                                color: '#000'
                            }),
                            stroke: new window.ol.style.Stroke({
                                color: '#fff',
                                width: 3
                            })
                        })
                    });
                    var styles = [style];


                    var vectorHeatmap = new window.ol.layer.Heatmap({
                        source: new window.ol.source.Vector({
                            format: new window.ol.format.GeoJSON(),
                            url: CONFIG.restoServerUrl + '/' + CONFIG.statistics.statsEndpoint + '/users/countries/centroid'
                        }),
                        opacity: 0.9
                    });

                    vectorHeatmap.getSource().on('addfeature', function (event) {
                        var count = parseFloat(event.feature.get('count'));
                        event.feature.set('weight', count);
                    });

                    var raster = new window.ol.layer.Tile({
                        source: new window.ol.source.Stamen({
                            layer: 'toner'
                        })
                    });

                    $timeout(function () {
                        var map = new window.ol.Map({
                            layers: [vectorMap],
                            target: identifier,
                            view: new window.ol.View({
                                center: [0, 0],
                                zoom: 1
                            })
                        });

                        /*
                         var selectMouseMove = new window.ol.interaction.Select({
                         condition: window.ol.events.condition.mouseMove
                         });
                         map.addInteraction(selectMouseMove);
                         */
                        map.on('pointermove', function (evt) {
                            if (evt.dragging) {
                                return;
                            }
                            var pixel = map.getEventPixel(evt.originalEvent);
                            var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                                return feature;
                            });
                            if (feature && $scope.feat.name != feature.get('name')) {
                                $scope.$apply(function () {
                                    $scope.feat.count = parseFloat(feature.get('count') ? feature.get('count') : 0);
                                    $scope.feat.name = feature.get('name');
                                    $scope.feat.ranking = feature.get('ranking');
                                });
                            }

                        });

                        statsAPI.getUsersWorldGeometry(function (data) {

                            // Create new layer
                            var vectorLayer = new window.ol.layer.Vector({
                                source: new window.ol.source.Vector({
                                    features: (new window.ol.format.GeoJSON()).readFeatures(data, {featureProjection: 'EPSG:3857'})
                                }),
                                style: function (feature, resolution) {
                                    style.getText().setText(resolution < 8000 ? feature.get('name') : '');
                                    style.getStroke().setColor(colorCodes[feature.get('ranking')]);
                                    style.getFill().setColor(colorCodes[feature.get('ranking')]);
                                    return styles;
                                }
                            });
                            map.addLayer(vectorLayer);
                        }, function () {
                            $scope.throwError('error.getGeometry');
                        });

                    }, 200);

                    //$scope.maps[identifier] = map;

                };

                /**
                 * Get counts by field - set data to construct charts
                 * 
                 * @param {type} field
                 * @returns {undefined}
                 */
                $scope.getCount = function (field) {

                    statsAPI.getCount(field, function (data) {
                        $scope.stats[field] = data;
                        $scope.chart[field] = [];
                        $scope.chart[field].data = [];
                        $scope.chart[field].labels = [];
                        for (var i = 0; i < data.length; i++) {
                            if (data[i][1] !== 0 && data[i][0]) {
                                $scope.chart[field].data[i] = data[i][1];
                                $scope.chart[field].labels[i] = data[i][0];
                            }
                        }
                        $scope.chart[field].data = [$scope.chart[field].data];
                    }, function () {
                        $scope.throwError('error.getCount : ' + field);
                    });
                };

                /**
                 * Get logs counts by service and by month - set data to construct charts
                 * 
                 * @param {string} service
                 * @returns {undefined}
                 */
                $scope.getLogsCountsByMonth = function (service) {

                    statsAPI.getLogsCountsByRecentMonth(service, $scope.params, function (data) {
                        var series = [];
                        // Will contain months
                        var labels = [];
                        // Will contain counts values
                        var values = [];
                        var previous_date = 'nothing';
                        for (var i = 0; i < data.length; i++) {
                            // Check if series array contains current collection
                            if (series.indexOf(data[i].collection) === -1) {
                                // Add current collection to series array
                                series.push(data[i].collection);

                            }

                            // Get the collection's current index
                            var collection_current_index = series.indexOf(data[i].collection);

                            // Check if we get a new date
                            if (previous_date !== data[i].date) {
                                // It's a new date, add it to series
                                labels.push(data[i].date);
                                // Update previous date
                                previous_date = data[i].date;
                            }

                            // Get month index
                            var month_index = labels.indexOf(data[i].date);

                            // Check if values are defined for current collection
                            if (typeof values[collection_current_index] === 'undefined') {
                                values[collection_current_index] = [];
                            }

                            for (var j = 0; j <= month_index; j++) {
                                if (j === month_index) {
                                    // Add value to final array
                                    values[collection_current_index][month_index] = data[i].count;
                                } else if (values[collection_current_index].indexOf(j) === -1) {
                                    values[collection_current_index].push(0);
                                }
                            }
                        }

                        $scope.chart[service] = [];
                        $scope.chart[service].series = series.length > 0 ? series : [''];
                        $scope.chart[service].labels = labels.length > 0 ? labels : [''];
                        $scope.chart[service].values = values.length > 0 ? values : [''];
                    }, function () {
                        $scope.throwError('error.getCountByMonth : ' + service);
                    });
                };

                /**
                 * Get best logs by products
                 * 
                 * @param {string} label
                 * @param {string} service
                 * @param {string} filters
                 * @returns {undefined}
                 */
                $scope.getLogsBestCountsByProduct = function (label, service, filters) {
                    if ($scope.params.collection) {
                        filters.collection = $scope.params.collection;
                    }
                    statsAPI.getLogsCountsByProduct(service, filters, function (data) {
                        $scope.products.best[label] = data;
                    }, function () {
                        $scope.throwError('error.getCountByProduct : ' + label);
                    });
                };

                /**
                 * Get downloads counts by user
                 * 
                 * @param {string} label
                 * @param {string} filters
                 * @returns {undefined}
                 */
                $scope.getDownloadsCountsByUser = function (label, filters) {
                    if ($scope.params.collection) {
                        filters.collection = $scope.params.collection;
                    }
                    statsAPI.getDownloadsCountsByUser(filters, function (data) {
                        $scope.products.best[label] = data;
                    }, function () {
                        $scope.throwError('error.getCounByUser : ' + label);
                    });
                };

                /**
                 * Init a density map
                 * 
                 * @param {string} identifier
                 * @param {method} loader
                 * @returns {undefined}
                 */
                $scope.initDensityMap = function (identifier, loader) {

                    /*
                     * Create layer which contains world map in a low resolution
                     * 
                     * The map is loaded from server data
                     */
                    var vectorMap = new window.ol.layer.Vector({
                        source: new window.ol.source.Vector({
                            // TODO : change this by a configurable way
                            url: 'data/countries.geojson',
                            format: new window.ol.format.GeoJSON()
                        }),
                        style: new window.ol.style.Style({
                            fill: new window.ol.style.Fill({
                                color: '#fff'
                            }),
                            stroke: new window.ol.style.Stroke({
                                color: '#319FD3',
                                width: 0.5
                            }),
                            text: new window.ol.style.Text({
                                font: '12px Calibri,sans-serif',
                                fill: new window.ol.style.Fill({
                                    color: '#000'
                                }),
                                stroke: new window.ol.style.Stroke({
                                    color: '#fff',
                                    width: 3
                                })
                            })
                        })
                    });

                    /*
                     * Define style for countries users density
                     */
                    var style = new window.ol.style.Style({
                        fill: new window.ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.6)'
                        }),
                        stroke: new window.ol.style.Stroke({
                            color: '#319FD3',
                            width: 1
                        }),
                        text: new window.ol.style.Text({
                            font: '12px Calibri,sans-serif',
                            fill: new window.ol.style.Fill({
                                color: '#000'
                            }),
                            stroke: new window.ol.style.Stroke({
                                color: '#fff',
                                width: 3
                            })
                        })
                    });
                    var styles = [style];

                    /*
                     * To avoid error, wait before map creation
                     */
                    $timeout(function () {
                        // Create new Map
                        var map = new window.ol.Map({
                            layers: [vectorMap],
                            target: identifier,
                            view: new window.ol.View({
                                center: [0, 0],
                                zoom: 1
                            })
                        });

                        // Get feature options when pointer is over it
                        map.on('pointermove', function (evt) {
                            if (evt.dragging) {
                                return;
                            }
                            var pixel = map.getEventPixel(evt.originalEvent);
                            var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                                return feature;
                            });
                            if (feature && $scope.feat.name != feature.get('name')) {
                                // Apply scope to display information on web page
                                $scope.$apply(function () {
                                    $scope.feat.count = parseFloat(feature.get('count') ? feature.get('count') : 0);
                                    $scope.feat.name = feature.get('name');
                                    $scope.feat.ranking = feature.get('ranking');
                                });
                            }

                        });

                        // If a loader function is set
                        if (loader) {
                            /*
                             * Load density informations from server
                             */
                            loader(function (data) {

                                // Create new layer
                                var vectorLayer = new window.ol.layer.Vector({
                                    source: new window.ol.source.Vector({
                                        features: (new window.ol.format.GeoJSON()).readFeatures(data, {featureProjection: 'EPSG:3857'})
                                    }),
                                    style: function (feature, resolution) {
                                        /*
                                         * Set style depending on ranking value
                                         * 
                                         * More ranking is high, more dark will be associated color
                                         */
                                        style.getText().setText(resolution < 8000 ? feature.get('name') : '');
                                        style.getStroke().setColor(colorCodes[feature.get('ranking')]);
                                        style.getFill().setColor(colorCodes[feature.get('ranking')]);
                                        return styles;
                                    }
                                });

                                // Add layer to current Map
                                map.addLayer(vectorLayer);
                            }, function () {
                                $scope.throwError('error : cannot get information about users countries');
                            });
                        }

                        // Add current Map to maps list
                        $scope.maps[identifier] = map;

                    }, 200);
                };

                $scope.download = function (url) {
                    administrationServices.download(url);
                };

                $scope.initDownloadLinks = function () {

                    var query_parameters = '';
                    var first = true;
                    for (var key in $scope.params) {
                        if (first) {
                            query_parameters = query_parameters + "?" + key + "=" + $scope.params[key];
                            first = false;
                        } else {
                            query_parameters = query_parameters + "&" + $scope.params.key + "=" + $scope.params.value;
                        }
                    }

                    $scope.downloadableLinks = {
                        'downloads': CONFIG.restoServerUrl + CONFIG.statistics.statsEndpoint + '/downloads.csv' + query_parameters,
                        'search': CONFIG.restoServerUrl + CONFIG.statistics.statsEndpoint + '/search.csv' + query_parameters,
                        'insert': CONFIG.restoServerUrl + CONFIG.statistics.statsEndpoint + '/insert.csv' + query_parameters
                    };
                };

                /**
                 * Set param by passing his name and his value
                 * 
                 * @param {string} type - name of the param
                 * @param {string} value - value of the param
                 * @returns {undefined}
                 */
                $scope.setParam = function (type, value) {
                    if (type === 'collection') {
                        $scope.params.collection = value;
                    }

                    $scope.initStatsAndCharts();
                };

                /**
                 * Throw error
                 * 
                 * @param {String} $errorMessage
                 */
                $scope.throwError = function ($errorMessage) {
                    //$scope.error.push($errorMessage);
                    //alert($errorMessage);
                    var message = '<strong>Error : </strong>' + $errorMessage;
                    Flash.create('danger', message);
                };

                /**
                 * Init controller
                 * 
                 * @returns {undefined}
                 */
                $scope.init = function () {

                    if (CONFIG.statistics.displayMapDensity) {
                        // Init map which represents users world repartition
                        $scope.initDensityMap('mapUsers', statsAPI.getUsersWorldGeometry);
                    }

                    // Get collections
                    restoCollectionsAPI.getCollections(function (data) {
                        $scope.collections = data;
                        $scope.collections.unshift({name: ''});
                    }, function () {
                        /**
                         * In case of error while getting collections, filter on collection
                         * will not be available
                         */
                        $scope.collections = null;
                    });

                    $scope.initStatsAndCharts();
                };

                /**
                 * Init stats 
                 * 
                 * @returns {undefined}
                 */
                $scope.initStatsAndCharts = function () {
                    $scope.stats = [];
                    $scope.chart = [];
                    $scope.products = [];
                    $scope.products.best = [];

                    // Get count for countries
                    $scope.getCount('country');
                    // Get count for organizations countries
                    $scope.getCount('organizationcountry');
                    // Get count for topics
                    $scope.getCount('topics');
                    // Get logs counts for downloads
                    $scope.getLogsCountsByMonth('downloads');
                    // Get logs counts for search
                    $scope.getLogsCountsByMonth('search');
                    // Get logs counts for insert
                    $scope.getLogsCountsByMonth('insert');
                    // Get 10 best downloads by product
                    $scope.getLogsBestCountsByProduct('downloads_all_time', 'downloads', {'_limit': 10});
                    // Get 10 best search by products
                    $scope.getDownloadsCountsByUser('downloaders_all_time', {'_limit': 10});

                    $scope.initDownloadLinks();
                };

                // Inform mainController that we are loading stats section
                $scope.$emit('showStats');

                // Init controller
                $scope.init();

            }

        }
        )(window.ol);

    }
    ;
})(window);
