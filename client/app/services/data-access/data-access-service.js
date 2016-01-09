/**
 * Created by yotam on 8/1/2016.
 */
'use strict';

angular.module('myApp.services.data-access.data-access-service', [])

    .service('appData', ['$http', function ($http) {
        var base = "http://127.0.0.1:1337/"
        var appData = {
            post: function (path, data) {
                return $http.post(base + path, data)

            },
            getAll: function (model) {
                return $http.get(base + model)
            },
            save: function (model, data) {
                return $http.post(base + model, data)

            },
        };
        return appData;
    }]);
