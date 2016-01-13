'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngMaterial',
    'ui.codemirror',
    'ui.grid',

    'myApp.editor',
    'myApp.view2',
    'myApp.version',
    'myApp.services.data-access'
]).
config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/editor'});
}]);
