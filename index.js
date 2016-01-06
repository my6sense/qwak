/**
 Phase I:

 - data will be stored in memory.
 Phase II:

 - user can add configuration files by pointing to a local path / url
 Phase III (Stand-alone server):

 1) Data files are stored locally with the server.
 2) user can configure a data persistance layer for the server (mongo / Static files by default ?).
 CRUD can then be applied on the data. On this stage I need to think if all data should
 be stored in dedicated files, or there is any value in a DB.

 */
var queryBuilder = require("./lib/queryBuilder");
var Kwak = {

    // CRUD for each entity - with validations..
    addDataSource: function (dataSources) {

    },
    addDataView: function (dataViews) {

    },
    addDataSet: function (dataSets) {

    },
    addPredefinedFilter: function (filter) {

    },
    addCustomSQL: function (sql) {

    },
    setupConnector: function (connection) {
        queryBuilder.setupConnector(connection);
    },
    setupDataModels: function (externalDataViews, externalDataSets, externalDataSources) {
        queryBuilder.setupDataModels(externalDataViews, externalDataSets, externalDataSources);
    },
    init: function (dataSources, dataViews, dataSets) {
        // validate compatibility (all views defined in sets must exist, etc..)
        // queryBuilder.init();
    },
    build: function (config) {
        // validate that all the data configuration are set.
        return queryBuilder.build(config)
    },
    buildReport: function (reportConfig) {
        // validate that all the data configuration are set.
        return queryBuilder.buildReport(reportConfig)
    }
};
module.exports = Kwak;