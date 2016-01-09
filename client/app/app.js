'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngMaterial',
    'ui.codemirror',
    'ui.grid',

    'myApp.view1',
    'myApp.view2',
    'myApp.version',
    'myApp.services.data-access'
]).
config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/view1'});
}]);
