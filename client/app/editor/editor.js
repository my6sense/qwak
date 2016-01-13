'use strict';

angular.module('myApp.editor', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/editor', {
            templateUrl: 'editor/editor.html',
            controller: 'EditorCtrl'
        });
    }])

    .controller('EditorCtrl', ['$scope', '$http', '$timeout', 'appData', '$q',
        function ($scope, $http, $timeout, appData, $q) {

            // --- INNER FUNCTIONS --- //

            function _init() {
                $scope.vm = {
                    dataModels: {
                        DATA_SOURCE: {
                            title: "Data Sources",
                            data: [],
                            activeIndex: 0,
                            path: 'dataSource',
                            demo: {
                                name: "localDb",
                                client: 'sqlite3',
                                connection: {
                                    filename: "./test.db"
                                }
                            }
                        },
                        DATA_VIEW: {
                            title: "Views",
                            data: [],
                            activeIndex: 0,
                            path: 'dataView',
                            demo: {
                                "name": "sampleView",
                                "table": "Events",
                                "fields": [
                                    {
                                        "name": "id",
                                        "type": "dimension",
                                        "query": {
                                            "field": "id"
                                        }
                                    },
                                    {
                                        "name": "measure1",
                                        "type": "measure",
                                        "query": {
                                            "field": "measure1"
                                        }
                                    },
                                ]

                            },
                        },
                        DATA_SET: {
                            title: "Sets",
                            data: [],
                            activeIndex: 0,
                            path: 'dataSet',
                            demo: {
                                "name": "sampleSet",
                                "dataSource": "localDb",
                                "data": {
                                    "joins": [
                                        {
                                            "view": "sampleView"
                                        }
                                    ]

                                }
                            },
                        },
                        DATA_QUERY: {
                            title: "Queries",
                            data: [],
                            activeIndex: 0,
                            path: 'dataQuery',
                            demo: {
                                "name" : "Query name",
                                "data_set": "sampleSet",
                                "dimensions": ['sampleView.id'],
                                "measures": ['sampleView.measure1'
                                ],
                                "filters": {

                                    "sampleView.id": [
                                        {
                                            "operator": ">=",
                                            "value": "2"
                                        }
                                    ],
                                }

                            },
                        }
                    }
                };

                $scope.tabsRefresher = {
                    sources: false,
                    views: false,
                    sets: false,
                    query: false
                };
                $scope.refreshAllTabsCodeMirrors();
                $scope.showActionStatus = false;
                $scope.actionStatus = "";
                $scope.tabs = [];

                $scope.queryResults = "";
                $scope.editorOptions = {
                    lineWrapping: true,
                    lineNumbers: false,
                    indentWithTabs: true,
                    //readOnly: 'nocursor',
                    mode: 'Javascript',
                };
                $scope.gridOptions = {
                    columnDefs: []
                };
                $scope.getModels();

            }
            function setGridColumns(data) {
                var colDefs = [];
                if (data.length) {
                    var firstRowKeys = _.keys(data[0]);
                    // iterate over first data row.
                    for (var i = 0; i < firstRowKeys.length; i++) {
                        var col = {field: firstRowKeys[i], displayName: firstRowKeys[i], width: 100};
                        colDefs.push(col);
                    }
                    $scope.gridOptions.columnDefs = colDefs;
                }
                /*                $scope.gridOptions = {
                 columnDefs: [{ field: 'id', displayName: 'ID', width: 90 },
                 { field: 'measure1', displayName: 'Measure', width: 80 },
                 ]
                 };*/
            }

            // --- SCOPE FUNCTIONS --- //

            $scope.getModels = function () {
                $q.all([
                    appData.getAll("dataView"),
                    appData.getAll("dataSource"),
                    appData.getAll("dataSet"),
                    appData.getAll("dataQuery"),
                ]).then(function (results) {
                    $scope.vm.dataModels.DATA_VIEW.data = results[0].data;
                    $scope.vm.dataModels.DATA_SOURCE.data = results[1].data;
                    $scope.vm.dataModels.DATA_SET.data = results[2].data;
                    $scope.vm.dataModels.DATA_QUERY.data = results[3].data;
/*                    $scope.vm.dataModels = {
                        DATA_VIEW: results[0].data,
                        DATA_SOURCE: results[1].data,
                        DATA_SET: results[2].data
                    };*/
                    $scope.modelSelected("DATA_SOURCE", 0);
                    //$scope.showActionCompletedIndication("Models Loaded Successfully!","success");

                }, function (error) {
                    $scope.showActionCompletedIndication("Error. Could not load data. :( ","error");

                });
            };
            $scope.showActionCompletedIndication = function (msg, type) {
                $scope.actionStatus = msg;
                $scope.showActionStatus = true;
                $scope.actionStatusClass = (type || 'neutral');
                $timeout(function () {
                    $scope.showActionStatus = false;
                }, 5000);
            };
            $scope.generateReport = function () {
                var query = $scope.vm.dataModels.DATA_QUERY.data[$scope.vm.dataModels.DATA_QUERY.activeIndex];
                if (!query){
                    $scope.showActionCompletedIndication("Yo! Please create a data query first.","warning");
                    return;
                }
                appData.post("dataQuery/run", query).success(function (data) {
                    setGridColumns(data);
                    $scope.gridOptions.data = data;
                    $scope.showActionCompletedIndication("Report Generated!","success");
                    $scope.activeTabIndex = 4;
                });
            };
            $scope.refreshAllTabsCodeMirrors = function () {
                console.log("refreshAllTabsCodeMirrors");
                $timeout(function () {
                    $scope.tabsRefresher.sources = !$scope.tabsRefresher.sources;
                    $scope.tabsRefresher.views = !$scope.tabsRefresher.views;
                    $scope.tabsRefresher.sets = !$scope.tabsRefresher.sets;
                    $scope.tabsRefresher.query = !$scope.tabsRefresher.query;
                });
            };
            $scope.modelSectionSelected = function (modelType) {
                $scope.activeModelType = modelType;
                //$scope.modelSelected(modelType, 0);
            };
            $scope.modelSelected = function (modelType, index) {
                console.log("modelSelected - " + modelType + " - index : " + index);
                $scope.vm.dataModels[modelType].activeIndex = index;
            };
            $scope.addPreviewModel = function () {
                var newModel = _.clone($scope.vm.dataModels[$scope.activeModelType].demo);
                newModel.token = new Date().getTime();
                $scope.vm.dataModels[$scope.activeModelType].data.unshift(newModel); // add new item to list
                $scope.modelSelected($scope.activeModelType, 0); // select the new created item in list
            };
            $scope.saveOrUpdateModel = function () {
                var activeModel = $scope.vm.dataModels[$scope.activeModelType].data[$scope.vm.dataModels[$scope.activeModelType].activeIndex];
                appData.saveOrUpdate($scope.vm.dataModels[$scope.activeModelType].path, activeModel).success(function (result) {
                    // update the model with the new data
                    $scope.vm.dataModels[$scope.activeModelType].data[$scope.vm.dataModels[$scope.activeModelType].activeIndex] = result;
                    $scope.showActionCompletedIndication("Model Created Successfully!","success");

                });
            };
            $scope.deleteModel = function () {
                function removeItem(){
                    $scope.vm.dataModels[$scope.activeModelType].data.splice($scope.vm.dataModels[$scope.activeModelType].activeIndex, 1);
                    $scope.modelSelected($scope.activeModelType, 0);
                    $scope.showActionCompletedIndication("Model Deleted.","success");
                }
                var activeModel = $scope.vm.dataModels[$scope.activeModelType].data[$scope.vm.dataModels[$scope.activeModelType].activeIndex];
                if (!activeModel.id){ // not yet in DB, remove from vm
                    removeItem();
                } else {
                    appData.remove($scope.vm.dataModels[$scope.activeModelType].path, activeModel).then(function () {
                        removeItem();
                    });
                }

            };

            // --- INIT --- //

            _init();
        }

    ])
    .directive('jsonParse', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elt, attrs, modelCtrl) {

                // conversion "view -> model"
                modelCtrl.$parsers.push(function (value) {
                    console.log('Value:', value);
                    return angular.fromJson(value);
                })

                // conversion "model -> view"
                modelCtrl.$formatters.push(function formatter(modelValue) {
                    console.log('modelValue:', modelValue);
                    return angular.toJson(modelValue, true);
                })
            }
        }
    })