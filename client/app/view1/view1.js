'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$http','$timeout', function ($scope, $http, $timeout) {

        // --- INNER FUNCTIONS --- //

        function _init() {
            $scope.showActionStatus = false;
            $scope.actionStatus = "";

            $scope.queryResults = "";
            $scope.configs = {
                dataSources: JSON.stringify([
                    {a: "1"},
                    {b: "2"}]),
                dataViews: JSON.stringify([{a: "1"}, {b: "2"}]),
                dataSets: JSON.stringify([{a: "1"}, {b: "2"}]),
            };
            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: false,
                readOnly: 'nocursor',
                mode: 'json',
            };
        }

        // --- SCOPE FUNCTIONS --- //
        $scope.updateModels = function () {
            $http.post("/init", $scope.configs).success(function () {
                $scope.queryResults = "1,2,3,4";
                $scope.showActionCompletedIndication("Success!");
                $scope.activeTabIndex = 3;
            });
        };
        $scope.showActionCompletedIndication = function(msg){
            $scope.actionStatus = msg;
            $scope.showActionStatus = true;
            $timeout(function(){
                $scope.showActionStatus = false;
            },6000);
        };

        // --- INIT --- //

        _init();
    }]);