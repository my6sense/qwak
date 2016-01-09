/**
 * Created by my6sense on 11/4/15.
 */

/**
 @typedef DataSet
 @type {object}
 @property {string} id - an ID.
 **/

/**
 @typedef QueryProps
 @type {object}
 @property {string} id - an ID.
 **/

/**
 @typedef ReportConfig - The reportConfig object specifies the query that will be retrieved from a certain {@link DataSet}.
 @type {object}
 @property {string} data_set - A string identifying the {@link DataSet} to be used for the query.
 @property {Array.<string>} dimensions - Array of strings that represent the fields to group by (in the specified order).
 @property {Array.<string>} measures - Fields that will be aggregated according to the given dimensions. Measures can either be the
 * actual fields name or a calculated measure
 @property {Array.<string>} extra - Array of strings that represent extra fields to view.
 @property {Object} parameters - are external data that can be used by custom filters or custom fields selections, for example, a timezone
 * parameter to convert the dates wherever needed.
 @property {Object} filters - will be inserted in the 'where' clauses of the query. you can either specify
 * a single filter on a field, or multiple filters. You can apply custom filters list on a field, and provide it
 * with external parameters.
 **/

var knex;
var _ = require("underscore");
var q = require('q');
function getActualFieldByViewField(viewField, dataViews) {
    var view = viewField.split(".")[0];
    var field = viewField.split(".")[1];
    var viewObj = _.findWhere(dataViews, {name : view});
    var fieldObj = _.findWhere(viewObj.fields, {name: field});
    if (fieldObj) { // if there is alias on the field we use it for the order by clause (since it's above in the hierarchy)
        field = fieldObj.as || fieldObj.name;
    }
    var table = viewObj.table;
    return table + "." + field;

}

function findValueToReplace(value, parameters, query_fields, table) {
    var INTERNAL_FIELD_PREFIX_TOKEN = '{';
    var INTERNAL_FIELD_SUFFIX_TOKEN = '}';

    var EXTERNAL_PARAM_PREFIX_TOKEN = '${';
    var EXTERNAL_PARAM_SUFFIX_TOKEN = '}';
    // If external parameters prefix, i.e: {$param_to_use} - extract param and return it as the value

    // If internal field prefix, i.e: {field_to_replace} - return the processed field.
    // run generateFieldString(parameters,query_fields, table,fieldDescription)

    if (_.isString(value) && value.indexOf(INTERNAL_FIELD_PREFIX_TOKEN) === 0 &&
        value.match(INTERNAL_FIELD_SUFFIX_TOKEN + "$") &&
        value.match(INTERNAL_FIELD_SUFFIX_TOKEN + "$")[0] === INTERNAL_FIELD_SUFFIX_TOKEN) {
        // trim prefix and suffix
        var key = value.substring(INTERNAL_FIELD_PREFIX_TOKEN.length, value.length - INTERNAL_FIELD_SUFFIX_TOKEN.length);
        // find the field with name === field_to_replace.
        var fieldDescription = _.findWhere(query_fields[0].fields, {name: key});
        var rawFieldStr = generateFieldString(parameters, query_fields, table, fieldDescription, false);
        return rawFieldStr;


    } else {
        if (_.isString(value) && value.indexOf(EXTERNAL_PARAM_PREFIX_TOKEN) === 0 &&
            value.match(EXTERNAL_PARAM_SUFFIX_TOKEN + "$") &&
            value.match(EXTERNAL_PARAM_SUFFIX_TOKEN + "$")[0] === EXTERNAL_PARAM_SUFFIX_TOKEN) {

            var key = value.substring(EXTERNAL_PARAM_PREFIX_TOKEN.length, value.length - EXTERNAL_PARAM_SUFFIX_TOKEN.length);

            if (key && (!parameters || parameters[key] === undefined)) {
                throw new Error("Trying to replace {" + key + "} , which is not defined.");
            }
            return parameters[key];
        }

    }

    return value;
}
/**
 * convert each value that is surrounded with {} to the value value that is mapped
 * to the key inside the curly braces.
 * @private
 * @param array
 * @param parameters
 */
function replaceParameters(array, parameters, query_fields, table) {

    if (array && array.length) {

        for (var i = 0; i < array.length; i++) {
            var replacedValue = findValueToReplace(array[i], parameters, query_fields, table);
            array[i] = replacedValue;
        }
    }
    return array;

}
/**
 * Join the given queries.
 * @private
 * @param queries to join
 * @returns {*} a new Knex query object which joins the given queries
 */
function joinDataSet(joinDescription, queries, views) {
    function getFieldNameToUse(idx, joinDescription) {
        var originalFieldName = joinDescription[idx].field;
        var viewFields = _.findWhere(views[joinDescription[idx].view].fields, {name: originalFieldName});
        var alias = viewFields.as || viewFields.name || null; // try to find alias definition in the view
        var fieldName = alias ? alias : joinDescription[idx].field; // use the alias if exists.
        return fieldName;
    }

    var q = knex.select('*');
    var first = queries[0];
    q.from(first);
    for (var i = 1; i < queries.length; i++) {
        q.join(queries[i], function () {

            var fieldName1 = getFieldNameToUse(i - 1, joinDescription);
            var fieldName2 = getFieldNameToUse(i, joinDescription);
            var viewObj1 = _.findWhere(views,{name: joinDescription[i - 1].view});
            var viewObj2 = _.findWhere(views,{name: joinDescription[i].view});
            this.on(viewObj1.table + "." + fieldName1, "=", viewObj2.table + "." + fieldName2);
        });
    }
    return q;
}
/**
 * @private
 * @param view
 * @param fieldsList
 * @param fieldsType
 * @returns {*}
 */
function generateFields(view, fieldsList, fieldsType) {
    if (!fieldsType || !view || !view.fields || !view.fields.length || !fieldsList || !fieldsList.length) {
        throw new Error("Wrong parameters provided to generateFields function.");
        return null;
    }
    var viewFields = view.fields;
    // iterate over the fieldsList and return all the fields which match the view name
    var fieldsToUse = _.chain(fieldsList)
        .filter(function (fieldName) {
            var splitField = fieldName.split(".");
            if (splitField.length === 2) {
                var viewName = fieldName.split(".")[0];
                return (viewName === view.name);
            } else {
                throw new Error("Fields must be specified as <view_name>.<field_name>");
            }
        }).map(function (fieldName) { // return only the fields names
            var splitField = fieldName.split(".");
            return splitField[1];

        }).value();
    var result = _.chain(viewFields)
        .filter(function (obj) {
            return obj.type === fieldsType && _.contains(fieldsToUse, obj.name);
        })
        .map(function (obj) {
            if (obj.type === 'measure' && !obj.query.aggregate) { // all measure fields should be aggregated (sum is the default)
                obj.query.aggregate = "sum";
            }
            return obj;
        }).value();
    result = _.sortBy(result, function (obj) { // sort by the order that the fields were described in the fields list.
        return fieldsToUse.indexOf(obj.name);
    });
    return result;
}
/**
 * @private
 * @param view
 * @param filters
 * @returns {*}
 */
function generateFilters(view, filters) {
    if (!filters || !view || !view.fields || !view.fields.length) {
        throw new Error("Wrong parameters provided to generateFilters function.");
        return null;
    }
    var result = {};
    // iterate over the filters, and if the filter is in the viewFields, add the filter to
    // the filters object.
    var viewFields = view.fields;
    var filtersToUse = _.pick(filters, function (value, key, obj) {
        return _.findWhere(viewFields, {name: key.split(".")[1]});
    });
    // iterate over the filters for the current view, and add them to the query filter specifications.
    _.forEach(filtersToUse, function (filterContent, key) {
        var fieldName = key.split(".")[1];
        result[fieldName] = filterContent;
    });
    if (_.isEmpty(result)) {
        return null;
    }
    return result;
}
/**
 * Converts the given view into a query description object according to the propsToQuery object.
 *
 * @private
 * @param view view to query.
 * @param propsToQuery describes the specific query properties.
 * @param joinField
 * @returns {*} query description object.
 */
function convertViewToQueryDescription(view, propsToQuery, joinField) {

    var q = {
        table: view.table,
        query_fields: [
            {
                table: view.table,
                fields: []
            }
        ]
    };

    var fields = [];
    // copy all relevant dimensions into the query description (will translate to aggregated SELECT fields).
    var dimensionsToSelect = generateFields(view, propsToQuery.dimensions, 'dimension');
    fields = fields.concat(dimensionsToSelect);
    // copy extra fields and fields that are required for the join
    if (!dimensionsToSelect.length && propsToQuery.extra) { // only when there are no dimensions, add the view join field to select, if there are dimensions, it must be one of them.
        fields = fields.concat({name: joinField});
        fields = fields.concat(generateFields(view, propsToQuery.extra, 'extra'));
    } else {
        if (dimensionsToSelect.length && propsToQuery.extra) {
            console.warn("WARNING: Can't select extra fields when there are specified dimensions.");
        }
    }
    // copy all relevant measures into the query description (will translate to SELECT fields).
    if (propsToQuery.measures) {
        fields = fields.concat(generateFields(view, propsToQuery.measures, 'measure'));
    }


    q.query_fields[0].fields = fields;
    // generate the filters object (will translate to WHERE section)
    if (propsToQuery.filters) {
        q.filters = generateFilters(view, propsToQuery.filters);
    }
    // generate the 'groups' object. will create a group by for every dimension. (will translate to GROUP BY section)
    q.groups = _.filter(propsToQuery.dimensions, function (fieldName) {
        var viewName = fieldName.split(".")[0];
        return viewName === view.name;
    });
    q.parameters = propsToQuery.parameters;
    // TODO generate the 'sort' object (will translate to ORDER BY section)

    return q;
};
/**
 * generates a Knex query object from the given view and propsToQuery description.
 * @private
 * @param view the view to generate query for.
 * @param propsToQuery
 * @returns {*} a Knex query object.
 */
function generateQueryForView(view, propsToQuery, joinField) {
    var queryDescription = convertViewToQueryDescription(view, propsToQuery, joinField);
    console.log("queryDescription = ", JSON.stringify(queryDescription));
    return QueryBuilder.build(queryDescription);
}

function generateFieldString(parameters, query_fields, table, fieldDescription, useAlias) {
    var selectType, selectField;
    if (fieldDescription.query.raw) {
        selectType = 'RAW';
    } else {
        if (fieldDescription.query.customFunc) {
            selectType = 'CUSTOM_FUNC';
        } else {
            if (fieldDescription.query.aggregate) {
                selectType = 'AGG';
            } else {
                selectType = 'DEFAULT';
            }
        }
    }
    var alias = (useAlias) ? " as " + (fieldDescription.as || fieldDescription.name) : "";

    switch (selectType) {
        case 'RAW':
            //console.log("applying raw string to select: " + fieldDescription.raw);
            var raw = replaceParameters(_.clone(fieldDescription.query.raw.split(" ")), parameters, query_fields, table);

            selectField = knex.raw(raw.join(" ") + alias);
            break;
        case 'CUSTOM_FUNC':
            //console.log("applying customFunc to select: ", fieldDescription.customFunc);
            var args = replaceParameters(_.clone(fieldDescription.query.customFunc.args), parameters, query_fields, table);
            args.unshift(fieldDescription.query.field);
            args.unshift(table);
            var calculate = fieldDescription.query.customFunc.calculationFunc;
            selectField = customCalculations[calculate].apply(null, args) + alias;
            break;
        case 'AGG':
            //console.log("applying aggregation to select: ", fieldDescription.aggregate);
            selectField = "" + fieldDescription.query.aggregate + "(" + table + "." + fieldDescription.query.field + ")" + alias;
            break;
        case 'DEFAULT':
            //console.log("applying regular field to select: ", fieldDescription.name);
            selectField = table + "." + fieldDescription.query.field + alias;
            break;
    }
    return selectField;
}
/**
 * @private
 * @param queryProps
 * @returns {*}
 */
function prepareSelectSection(queryProps) {

    var query = knex.select();
    var fieldsArr = [];
    // fields has to include at least one table with one field
    if (!queryProps.query_fields) {
        throw new Error("query_fields property is empty.");
    }

    // iterate over all tables
    for (var i = 0; i < queryProps.query_fields.length; i++) {
        var tableConfig = queryProps.query_fields[i];
        if (tableConfig.fields && tableConfig.table) {
            for (var j = 0; j < tableConfig.fields.length; j++) { // in each table, iterate over the fields array
                var fieldDescription = tableConfig.fields[j];
                var fieldRawString = generateFieldString(queryProps.parameters, queryProps.query_fields, tableConfig.table, fieldDescription, true);
                fieldsArr.push(knex.raw(fieldRawString));
            }

        } else {
            console.warn("missing fields or table properties , in query_fields, index=" + i);
        }
    }

    return query.select(fieldsArr);
}


var customCalculations = {
    CTR: function (table, fieldName, val1, val2) {
        return "(" + table + "." + val1 + " / NULLIF(" + table + "." + val2 + " * 1.0,0)) * 100";
    },
    DATE_CONVERSION: function (table, fieldName, timezone) {
        //to_char(joinedTable.date,'MM/DD/YY')
        return "to_char(date(convert_timezone('" + timezone + "'," + table + "." + fieldName + ")),'MM/DD/YY')";
    },
    FILL_RATE: function (table, fieldName, requested_items_field, returned_items_field) {
        return "(" + returned_items_field + " / NULLIF(" + requested_items_field + "::float,0) * 100)";
    },
    DIV: function (table, fieldName, valueToDiv) {
        return "(sum(" + fieldName + ") / " + valueToDiv + "::float)";
    },
    ECPM: function (table, fieldName, money_amount_field, views_field) {
        return "(" + money_amount_field + " / NULLIF(" + views_field + "::float, 0) * 1000)";
    },
    ECPC: function (table, fieldName, money_amount_field, clicks_field) {
        return "(" + money_amount_field + " / NULLIF(" + clicks_field + "::float,0))";
    },
    COPY: function COPY(table, fieldName, fieldToCopy) {
        return "" + fieldToCopy;
    }
};
var customFilters = {
    DATE_RANGE: function (table, fieldName, startDate, endDate, timezoneCode) {
        return table + "." + fieldName + " >= " + " CONVERT_TIMEZONE('" + timezoneCode + "', 'UTC','" + startDate + "')" +
            " and " + table + "." + fieldName + " < " + "CONVERT_TIMEZONE('" + timezoneCode + "', 'UTC','" + endDate + "'::date + INTERVAL '1 day')"

    }
};
var _dataViews = null;
var _dataSets = null;
var _dataSources = null;

/**
 * Class that generates a query.
 * @class QueryBuilder
 *
 */
var QueryBuilder = {
    /**
     * @param connection
     */
    setupConnector: function (connection, generateSampleData) {
        var deferred = q.defer();
        var Knex = require('knex');
        knex = Knex(connection);
        if (generateSampleData){
            knex.schema.createTableIfNotExists('events', function (table) {
                table.increments('id');
                table.integer('measure1');
                table.timestamps();
            }).then(function () {
                console.log('Events Table is Created!');
                knex('events').insert([{measure1: 20}, {measure1: 30},  { measure1: 40}]).then(function(){
                    console.log('Events Table is filled with data!');
                    knex.raw("SELECT * FROM Events;")
                        .then(function (result) {
                            if (result) {
                                console.log(result);
                            }
                        });
                    deferred.resolve();

                });
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    },
    /**
     *
     * @param externalDataViews
     * @param externalDataSets
     */
    setupDataModels: function (dataModels) {
        var externalDataViews = dataModels.dataViews;
        var externalDataSets = dataModels.dataSets;
        var externalDataSources = dataModels.dataSources;
        function loadJson() {

        }

        _dataViews = externalDataViews || loadJson();
        _dataSets = externalDataSets || loadJson();
        _dataSources = externalDataSources || loadJson();
        console.log("Finished models setup.");
    },
    /**
     *
     * @param {QueryProps}
     * @returns {*}
     * @example
     {
         "table": "flat_statistics_comp",
         "query_fields": [
             {
             "table": "flat_statistics_comp",
             "fields": [
                 {"name": "networkId", "type": "dimension", "as": "network_id"}, {
                 "name": "providerId",
                 "type": "dimension",
                 "as": "provider_id"
             }, {
                 "name": "datestart",
                 "type": "dimension",
                 "as": "date",
                 "customFunc": {"calculationFunc": "DATE_CONVERSION", "args": ["{timezone_code}"]}
             }
             ]
         }],
         "filters": {
             "providerId": [{"operator": ">", "value": 0}],
             "datestart": [{"custom_filter": "DATE_RANGE", "args": ["{fromDate}", "{toDate}", "{timezone_code}"]}]
         },
         "groups": ["dsp_stats.networkId", "dsp_stats.providerId", "dsp_stats.datestart"],
         "parameters": {"timezone_code": "US/Eastern", "fromDate": "2015-12-10", "toDate": "2015-12-10"}
     }
     */

    build: function (queryProps) {
        console.log("\n!!! Starting the query build :) !!!\n");
        console.log(JSON.stringify(queryProps));
        var query;
        query = prepareSelectSection(queryProps);
        console.log("'select' section done, current query: " + query.toString());

        query = query.from(queryProps.table);
        console.log("'from' section done, current query: " + query.toString());

        if (queryProps.joins) {
            for (var i = 0; i < queryProps.joins.length; i++) {
                var joinWith = {};
                var curJoin = queryProps.joins[i];
                joinWith[curJoin.tableToJoin.name + "." + curJoin.tableToJoin.field] = curJoin.mainTable.name + "." + curJoin.mainTable.field
                query.join(curJoin.tableToJoin.name, joinWith);
            }
        }
        console.log("'joins' section done, current query: " + query.toString());

        if (queryProps.filters) {
            function addFiltersToQuery(query, fieldName, filters, booleanOperation) {
                for (var i = 0; i < filters.length; i++) {
                    var filter = filters[i];
                    if (filter.custom_filter) { // custom filter
                        var args = replaceParameters(_.clone(filter.args), queryProps.parameters, queryProps.query_fields, queryProps.table); // replace arguments with external parameters
                        args.unshift(fieldName);
                        args.unshift(queryProps.table);
                        switch (booleanOperation) {
                            case 'AND':
                                query.andWhereRaw(customFilters[filter.custom_filter].apply(null, args));
                                break;
                            default:
                                query.whereRaw(customFilters[filter.custom_filter].apply(null, args));
                        }
                        //query.whereRaw();
                    } else { // preset filter
                        var value = findValueToReplace(filter.value, queryProps.parameters, queryProps.query_fields, queryProps.table);
                        switch (booleanOperation) {
                            case 'AND':
                                query.andWhere(fieldName, filter.operator, value);
                                break;
                            default:
                                query.where(fieldName, filter.operator, value);
                        }
                    }
                }

            }

            var fields = _.keys(queryProps.filters);

            function getFieldByKey(queryProps, key) {
                return _.findWhere(queryProps.query_fields[0].fields, {name: key}).query.field;
            }

            if (fields.length) {
                //TODO finish this
                var field = getFieldByKey(queryProps, fields[0]);
                addFiltersToQuery(query, field, queryProps.filters[fields[0]]);
                for (var i = 1; i < fields.length; i++) {
                    var key = fields[i];
                    field = getFieldByKey(queryProps, key);
                    addFiltersToQuery(query, field, queryProps.filters[key], 'AND');

                }
            }


        }
        console.log("'where' section done, current query: " + query.toString());

        if (queryProps.groups && queryProps.groups.length) {
            function range(start, end) {
                var arr = [];
                for (var i = start; i <= end; i++) {
                    arr.push(i);
                }
                return arr;
            }

            var groupByArr = range(1, queryProps.groups.length);
            query.groupByRaw(groupByArr.toString());
        }
        console.log("'group by' section done, current query: " + query.toString());

        return query;
    },
    /**
     * @param {ReportConfig}
     * @returns {*}

     * @example
     *
     * buildReport({
                "data_set": "dsps",
                "dimensions": ['datestart', 'providerId'],
                "measures": ['dsp_request', 'dsp_response_nobids', 'dsp_response', 'dsp_request_items_count', 'dsp_response_items_count', 'campaign_serve'],
                "extra": ['name'],
                "parameters": {
                    "timezone_code": "EST",
                    "fromDate": "2015-12-1",
                    "toDate": "2015-12-10"
                },
                "filters": {
                    "providerId": {
                        "operator": "=",
                        "value": 1,
                    },
                    "datestart": {
                        "custom": [
                            {
                                func: "DATE_RANGE",
                                "args": ["{fromDate}", "{toDate}", "{timezone_code}"]
                            }
                        ]
                    }
                });

     */
    buildReport: function (reportConfig, useSampleData) {
/*        console.log("_dataSources : " ,_dataSources);
        console.log("_dataSets: :" ,_dataSets);
        console.log(reportConfig.data_set);*/
        //TODO convert all the places where there is direct access by key to one of the models to work
        // with an the key as a property.
        var deferred = q.defer();
        var dataSet = _.findWhere(_dataSets, {name : reportConfig.data_set});
        var dataSource = _.findWhere(_dataSources,{name :dataSet.dataSource});

        QueryBuilder.setupConnector(dataSource,useSampleData).then(function(){
            // iterate over all the views in the data set.
            var views = _.pluck(dataSet.data.joins, 'view');
            var joinsProps = dataSet.data.joins;
            var viewsQueries = [];
            for (var i = 0; i < views.length; i++) {
                console.log("here0");

                var view =  _.findWhere(_dataViews, {name : views[i]});
                view.name = views[i];
                var joinField = _.findWhere(joinsProps, {view: view.name}).field;
                console.log("here1");
                // generate the query for the view with all the parameters above.
                var query = generateQueryForView(view, reportConfig, joinField).as(view.table);
                viewsQueries.push(query);
                console.log("here2");

            }

            for (var i = 0; i < viewsQueries.length; i++) {
                console.log(viewsQueries.toString());
            }
            console.log("here3");

            var query = joinDataSet(dataSet.data.joins, viewsQueries, _dataViews);
            var sortBy = reportConfig.sortBy;
            if (sortBy) {
                for (var i = 0; i < sortBy.length; i++) {
                    var sortByField = sortBy[i];
                    var actualField = getActualFieldByViewField(sortByField.field, _dataViews);
                    query.orderBy(actualField, sortByField.order || 'asc');
                }
            }

            console.log("final query: ", query.toString());

            // apply sort on the result.
            query.then(function(result){
                if (result){
                    deferred.resolve(result);
                } else {
                    deferred.reject(null);
                }

            },function(error){
                // error
                deferred.reject(error);

            });
        });
        return deferred.promise;
    }
};
module.exports = QueryBuilder;
