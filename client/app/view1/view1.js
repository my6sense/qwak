'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$http', '$timeout', 'appData', '$q',
        function ($scope, $http, $timeout, appData, $q) {

            // --- INNER FUNCTIONS --- //

            function _init() {
                $scope.modelTypes = {
                    DATA_SOURCE: "DATA_SOURCE",
                    DATA_VIEW: "DATA_VIEW",
                    DATA_SET: "DATA_SET",
                    DATA_QUERY: "DATA_QUERY",
                };
                $scope.activeModels = {
                    DATA_SOURCE: 0,
                    DATA_VIEW: 0,
                    DATA_SET: 0,
                    DATA_QUERY: 0,
                };
                $scope.modelPathName = {
                    DATA_SOURCE: 'dataSource',
                    DATA_VIEW: 'dataView',
                    DATA_SET: 'dataSet',
                    DATA_QUERY: 'dataQuery',
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
                $scope.previewModels = {
                    DATA_SOURCE: {
                        name: "localDb",
                        client: 'sqlite3',
                        connection: {
                            filename: "./test.db"
                        }
                    }
                    ,
                    DATA_VIEW: {
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
                    DATA_SET: {
                        "name": "sampleSet",
                        "dataSource": "localDb",
                        "data": {
                            "joins": [
                                {
                                    "view": "sampleView"
                                }
                            ]

                        }
                    }

                };
                $scope.queryConfig = angular.toJson({
                    "data_set": "sampleSet",
                    "dimensions": ['sampleView.id'],
                    "measures": ['sampleView.measure1'
                    ],
                    "filters": {

                        "sampleView.id": [
                            {
                                "operator": ">",
                                "value": "3"
                            }
                        ],
                    }
                }, true);

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

            function jsonFormatter(value) {
                if (value) {
                    return angular.toJson(value);
                }
            }

            //ngModel.$formatters.push(formatter);

            // --- SCOPE FUNCTIONS --- //
            $scope.getModels = function () {
                $q.all([
                    appData.getAll("dataView"),
                    appData.getAll("dataSource"),
                    appData.getAll("dataSet"),
                ]).then(function (results) {
                    $scope.dataModels = {
                        DATA_VIEW: results[0].data,
                        DATA_SOURCE: results[1].data,
                        DATA_SET: results[2].data
                    };
                    $scope.modelSelected($scope.modelTypes.DATA_SOURCE, 0);
                    $scope.showActionCompletedIndication("Models Loaded Successfully!");

                }, function (error) {
                    $scope.showActionCompletedIndication("Error. Could not load data. :( ");

                });
            }
            $scope.updateModels = function () {
                $q.all([
                    appData.save("dataView", $scope.configs.dataViews),
                    appData.save("dataSource", $scope.configs.dataSources),
                    appData.save("dataSet", $scope.configs.dataSets),
                ]).then(function () {
                    $scope.showActionCompletedIndication("Models Updated!");

                }, function (error) {
                    $scope.showActionCompletedIndication("Error. Could not save data.");

                });
            };
            $scope.showActionCompletedIndication = function (msg) {
                $scope.actionStatus = msg;
                $scope.showActionStatus = true;
                $timeout(function () {
                    $scope.showActionStatus = false;
                }, 15000);
            };
            $scope.generateReport = function () {
                appData.post("dataQuery/run", $scope.queryConfig).success(function (data) {
                    setGridColumns(data);
                    $scope.gridOptions.data = data;
                    $scope.showActionCompletedIndication("Report Generated!");
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
            $scope.modelSectionSelected = function (model) {
                $scope.modelSelected(model, 0);
            };
            $scope.modelSelected = function (modelType, index) {
                console.log("modelSelected - " + modelType + " - index : " + index);
                $scope.activeModels[modelType] = index;
                $scope.activeModelType = modelType;
                $scope.activeModel = angular.toJson($scope.dataModels[modelType][$scope.activeModels[modelType]], true);
            };
            $scope.addPreviewModel = function () {
                var newModel = _.clone($scope.previewModels[$scope.activeModelType]);
                newModel.token = new Date().getTime();
                $scope.dataModels[$scope.activeModelType].unshift(newModel);
                $scope.modelSelected($scope.activeModelType, 0);
            };
            $scope.saveOrUpdateModel = function () {
                var model = JSON.parse($scope.activeModel);
                appData.saveOrUpdate($scope.modelPathName[$scope.activeModelType], model).success(function(result){
                    // update the model with the new data
                    $scope.dataModels[$scope.activeModelType][$scope.activeModels[$scope.activeModelType]] = result;
                    $scope.activeModel = angular.toJson(result,true);

                });
            };
            $scope.deleteModel = function () {
                var model = JSON.parse($scope.activeModel);
                appData.remove($scope.modelPathName[$scope.activeModelType], model).then(function () {
                    // remove item from list
                    delete $scope.dataModels[$scope.activeModelType][$scope.activeModels[$scope.activeModelType]];
                });
            };
            // --- INIT --- //

            _init();
        }]);