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
    setupDataModels: function (dataModels) {
        console.log("Models setup started..", dataModels);
        queryBuilder.setupDataModels(dataModels);
    },
    build: function (config) {
        // validate that all the data configuration are set.
        return queryBuilder.build(config)
    },
    buildReport: function (reportConfig) {
        //TODO decide on the best way to pass the models that are used in the report
        // One way to do it is to init the models each time we build a report, but it seems wasteful.
        // Another way is to pass only the relevant models each time we query: the relevant data source, data set, and views
        // that are in the data set.
        //TODO decide on a better way to generate sample data.
        var GENERATE_SAMPLE_DATA = true;
        // validate that all the data configuration are set.
        return queryBuilder.buildReport(reportConfig,GENERATE_SAMPLE_DATA)
    }
};
module.exports = Kwak;