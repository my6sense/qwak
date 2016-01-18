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
config(['$routeProvider','$mdThemingProvider','$mdIconProvider', function ($routeProvider, $mdThemingProvider, $mdIconProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('amber')
        .accentPalette('amber');
    $mdIconProvider
        .defaultFontSet( 'fontawesome' )
    $routeProvider.otherwise({redirectTo: '/editor'});
}]);
