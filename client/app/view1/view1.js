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
                $scope.showActionStatus = false;
                $scope.actionStatus = "";

                $scope.queryResults = "";
                $scope.configs = {
                    dataSources: JSON.stringify(
                        {
                            name: "localDb",
                            client: 'sqlite3',
                            connection: {
                                filename: "./test.db"
                            }
                        }
                    ),
                    dataViews: JSON.stringify({
                        "name" : "sampleView",
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
                    }),
                    dataSets: JSON.stringify(
                        {
                            "name" : "sampleSet",
                            "dataSource": "localDb",
                            "data": {
                                "joins": [
                                    {
                                        "view": "sampleView"
                                    }
                                ]

                            }
                        }
                    ),
                };
                $scope.queryConfig = JSON.stringify({
                    "data_set": "sampleSet",
                        "dimensions": ['sampleView.id'],
                        "measures": ['sampleView.measure1'
                    ],
                        "filters": {

                        /*                    "events.network_id": [
                         {
                         "operator": "=",
                         "value": "${networkId}"
                         }
                         ],*/
                    }
                });

                $scope.editorOptions = {
                    lineWrapping: true,
                    lineNumbers: false,
                    readOnly: 'nocursor',
                    mode: 'json',
                };
            }

            // --- SCOPE FUNCTIONS --- //
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
                    $scope.queryResults = data;
                    $scope.showActionCompletedIndication("Report Generated!");
                    $scope.activeTabIndex = 4;
                });
            };

            // --- INIT --- //

            _init();
        }]);