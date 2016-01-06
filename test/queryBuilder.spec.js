/**
 * Created by my6sense on 11/4/15.
 */
var rewire = require('rewire');

var queryBuilder = rewire('./../lib/queryBuilder');

describe('queryBuilder tests: ', function () {
    var connectionTest = {
        debug: true,
        client: 'postgres'
    };
    var connectionRedshift = {
        debug: true,
        client: 'postgres'
    };
    var dataSources = {
        dev: connectionTest,
        redshift: connectionRedshift
    };
    var dataViews = {
        "view1": {

            "table": "tbl1",
            "fields": [

                {
                    "name": "dim1",
                    "type": "dimension",
                    "data_type": "number", // date , string, number
                    "format": "FORMAT_FUNC"
                },
                {
                    "name": "dim2",
                    "type": "dimension",
                    "data_type": "string", // date , string, number
                    "format": "FORMAT_FUNC2"
                },
                {
                    "name": "measure1",
                    "type": "measure",
                    "data_type": "number", // date , string, number
                    "customFunc": {
                        "calculationFunc": "CTR",
                        "args": ["field_name1", "field_name2"]
                    }
                },
                {
                    "name": "measure2",
                    "as": "measure2_alias",
                    "type": "measure",
                    "data_type": "number" // date , string, number
                }
            ]
        },
        "view2": {

            "table": "tbl2",
            "fields": [

                {
                    "name": "view2_dim1",
                    "type": "dimension",
                    "data_type": "number", // date , string, number
                    "format": "FORMAT_FUNC"
                },
                {
                    "name": "dim2",
                    "type": "dimension",
                    "data_type": "string", // date , string, number
                    "format": "FORMAT_FUNC2"
                },
                {
                    "name": "measure1",
                    "type": "measure",
                    "data_type": "number", // date , string, number
                    "customFunc": {
                        "calculationFunc": "CTR",
                        "args": ["field_name1", "field_name2"]
                    }
                },
                {
                    "name": "measure2",
                    "as": "measure2_alias",
                    "type": "measure",
                    "data_type": "number" // date , string, number
                }
            ]
        },
        "events": {
            "table": "flat_statistics_comp",
            "fields": [
                {
                    "name": "date",
                    "query" : {
                        field : "datestart",
                        "customFunc": {
                            "calculationFunc": "DATE_CONVERSION",
                            "args": ["${timezone_code}"]
                        }
                    },
                    "type": "dimension"
                },
                {
                    "name": "network_id",
                    "type": "dimension",
                    "query" : {
                        "field" : "networkId"
                    }
                },
                {
                    "name": "campaign_id",
                    "query" : {
                        "field" : "campaignId"
                    },
                    "type": "dimension"
                },
                {
                    "name": "impressions",
                    "query" : {
                        "field" : "ad_view"
                    },
                    "type": "measure"
                },
                {
                    "name": "paid_clicks",
                    "query" : {
                        "field" : "ad_click"
                    },
                    "type": "measure"
                },
                {
                    "name": "widget_requests",
                    "query" : {
                        "field" : "iterator_result"
                    },
                    "type": "measure"
                },
                {
                    "name": "page_views",
                    "query" : {
                        "field" : "page_view"
                    },
                    "type": "measure"
                },
                {
                    "name": "widget_views",
                    "query" : {
                        "field" : "viewed_bar"
                    },
                    "type": "measure"
                },
                {
                    "name": "internal_clicks",
                    "query" : {
                        "field" : "page_view_internal"
                    },
                    "type": "measure"
                },
                {
                    "name": "revenue",
                    "type": "measure",
                    "query" : {
                        "field" : "native_campaign",
                        "customFunc": {
                            "calculationFunc": "DIV",
                            "args": [100000]
                        }
                    }
                },
                {
                    "name": "potential_impressions",
                    "query" : {
                        "field" : "external_size"
                    },
                    "type": "measure"
                },
                {
                    "name": "served_impressions",
                    "query" : {
                        "field" : "ad_view"
                    },
                    "type": "measure"
                },
                {
                    "name": "campaigns_views",
                    "query" : {
                        "field" : "ad_view"
                    },
                    "type": "measure"
                },
                {
                    "name": "campaigns_clicks",
                    "query" : {
                        "field" : "ad_click"
                    },
                    "type": "measure"
                },
                {
                    "name": "campaigns_spend",
                    "query" : {
                        "raw" : "{revenue}"
                    },
                    "type": "measure"

                }
            ]

        },
        "campaigns_data": {
            "table": "networkcampaign",
            "fields": [
                {
                    "name": "name",
                    "type": "extra"

                }
            ]

        },
        "dsp_stats": {
            "table": "flat_statistics_comp",
            "fields": [
                {
                    "name": "datestart",
                    "type": "dimension",
                    "as" : "date",
                    "customFunc": {
                        "calculationFunc": "DATE_CONVERSION",
                        "args": ["${timezone_code}"]
                    }
                },
                {
                    "name": "publisherId",
                    "type": "dimension"
                    //"as": "widget_id"
                },
                {
                    "name": "providerId",
                    "type": "dimension",
                    "as": "provider_id"
                },
                {
                    "name": "accountId",
                    "type": "dimension"
                    //"as": "account_id"
                },
                {
                    "name": "networkId",
                    "type": "dimension",
                    "as" : "network_id"
                },

                {
                    "name": "dsp_request",
                    "type": "measure",
                    "as": "bid_requests"
                },
                {
                    "name": "dsp_response_nobids",
                    "type": "measure",
                    "as": "no_bids"
                },
                {
                    "name": "dsp_response",
                    "type": "measure",
                    "as": "bid_responses"
                },
                {
                    "name": "dsp_request_items_count",
                    "type": "measure",
                    "as": "requested_items"
                },
                {
                    "name": "dsp_response_items_count",
                    "type": "measure",
                    "as": "returned_items"
                },
                {
                    "name": "campaign_serve",
                    "type": "measure",
                    "as": "selected_items"
                },
                {
                    "name": "ad_view",
                    "type": "measure",
                    "as": "campaigns_views"
                },
                {
                    "name": "ad_click",
                    "type": "measure",
                    "as": "campaigns_clicks"
                },
                {
                    "name": "native_campaign",
                    "type": "measure",
                    "as": "campaigns_spend",
                    "customFunc": {
                        "calculationFunc": "DIV",
                        "args": [100000]
                    }
                },
                {
                    "name": "advertisers_ecpm",
                    "type": "measure",
                    "as": "advertisers_ecpm",
                    "customFunc": {
                        "calculationFunc": "ECPM",
                        "args": ["{native_campaign}","{ad_view}"]
                    }
                },
                {
                    "name": "advertisers_ecpc",
                    "type": "measure",
                    "as": "advertisers_ecpc",
                    "customFunc": {
                        "calculationFunc": "ECPC",
                        "args": ["{native_campaign}","{ad_click}"]
                    }
                },
                {
                    "name": "fill_rate",
                    "type": "measure",
                    "as" : "fill_rate",
                    "customFunc": {
                        "calculationFunc": "FILL_RATE",
                        "args": ["{dsp_request_items_count}","{dsp_response_items_count}"]
                    }
                },

            ]

        },
        "dsps_data": {
            "table": "thirdpartycampaignconnectors",
            "fields": [
                {
                    "name": "name",
                    "as" : "provider_name",
                    "type": "extra"

                }
            ]
        }

    };
    var dataSets = {
        "set1": {
            "dataSource": "dev",
            "data": {
                "joins": {
                    "view1": {
                        "field": "field1"
                    }
                }

            }

        },
        "set2": {
            "dataSource": "dev",
            "data": {
                "joins": {
                    "view1": {
                        "field": "id1"
                    },
                    "view2": {
                        "field": "id2"
                    }
                }

            }

        },
        "campaigns": {
            "dataSource": "redshift",
            "data": {
                "joins": {
                    "campaigns_stats": {
                        "field": "campaignId"
                    },
                    "campaigns_data": {
                        "field": "id"
                    }
                }

            }
        },
        "networks_events" : {
            "dataSource": "redshift",
            "data": {
                "joins": [
                    {
                        "view": "events"
                    }
                ]

            }
        },
        "dsps": {
            "dataSource": "redshift",
            "data": {
                "joins": [
                    {
                        "view": "dsp_stats",
                        "field": "providerId"
                    },
                    {
                        "view": "dsps_data",
                        "field": "id"
                    }
                ]

            }
        }
    };

    queryBuilder.setupDataModels(dataViews, dataSets, dataSources);

    xit('test basic postgres queries generation', function () {

        queryBuilder.setupConnector(connectionTest);

        expect(queryBuilder.build(
            {
                query_fields: '*',
                table: 'tableName',
                filters: {
                    id: 1
                },
                groups: 'id',
                joins: false

            }).toString()).toEqual('select * from "tableName" where "id" = \'1\' group by "id"');

        expect(queryBuilder.build({
            query_fields: [
                {
                    "table": "mainTable",
                    "fields": [
                        {
                            "name": "measure1"
                        }
                    ]
                }
            ],
            table: 'mainTable',
            filters: {
                id: 1
            },
            groups: 'id',
            joins: false

        }).toString()).toEqual('select mainTable.measure1 from "mainTable" where "id" = \'1\' group by "id"');

        expect(queryBuilder.build(
            {
                query_fields: [
                    {
                        "table": "mainTable",
                        "fields": [
                            {
                                "name": "measure1"
                            }
                        ]
                    },
                    {
                        "table": "joinedTable",
                        "fields": [
                            {
                                "name": "measure2",
                                "aggregate": "avg"
                            }
                        ]
                    }
                ],
                table: 'mainTable',
                filters: {
                    id: 1
                },
                groups: 'id',
                joins: [
                    {
                        mainTable: {
                            name: 'mainTable',
                            field: 'field1'
                        },
                        tableToJoin: {
                            name: 'joinedTable',
                            field: 'field2'
                        }
                    }
                ]

            }).toString()).toEqual('select mainTable.measure1, avg(joinedTable.measure2) from "mainTable" inner join "joinedTable" on "joinedTable"."field2" = "mainTable"."field1" where "id" = \'1\' group by "id"');

    });

    xdescribe('test report builder', function () {


        it('query from a single view', function () {

            var reportConfig = {
                "data_set": "set1",
                "dimensions": ['dim1', 'dim2'],
                "measures": ['measure1', 'measure2'],
                "filters": {
                    "measure1": {
                        "operator": "=",
                        "value": 2
                    }
                },
                "sorts": []
            };
            expect(queryBuilder.buildReport(reportConfig).toString())
                .toEqual('select * from ' +
                '(select (tbl1.field_name1 / NULLIF(tbl1.field_name2 * 1.0,0)) * 100,' +
                ' sum(tbl1.measure2) as measure2_alias,' +
                ' tbl1.dim1,' +
                ' tbl1.dim2' +
                ' from "tbl1" ' +
                'where "measure1" = \'2\' ' +
                'group by "dim1", "dim2") as "t1"');

            var reportConfig = {
                "data_set": "set1",
                "dimensions": ['dim1'],
                "measures": ['measure1', 'measure2'],
                "filters": {
                    "measure1": {
                        "operator": "=",
                        "value": 2
                    }
                },
                "sorts": []
            };

            expect(queryBuilder.buildReport(reportConfig).toString())
                .toEqual('select * from ' +
                '(select (tbl1.field_name1 / NULLIF(tbl1.field_name2 * 1.0,0)) * 100,' +
                ' sum(tbl1.measure2) as measure2_alias,' +
                ' tbl1.dim1' +
                ' from "tbl1" ' +
                'where "measure1" = \'2\' ' +
                'group by "dim1") as "t1"');
        });

        it('query from two views', function () {

            var reportConfig = {
                "data_set": "set2",
                "dimensions": ['dim1'],
                "measures": ['measure1', 'measure2'],
                "filters": {
                    "measure1": {
                        "operator": "=",
                        "value": 2
                    }
                },
                "sorts": []
            };
            var tbl1Query = "select (tbl1.field_name1 / NULLIF(tbl1.field_name2 * 1.0,0)) * 100," +
                " sum(tbl1.measure2) as measure2_alias," +
                " tbl1.dim1" +
                " from \"tbl1\"" +
                " where \"measure1\" = '2'" +
                " group by \"dim1\"";

            var tbl2Query = "select (tbl2.field_name1 / NULLIF(tbl2.field_name2 * 1.0,0)) * 100," +
                " sum(tbl2.measure2) as measure2_alias, tbl2.dim1" +
                " from \"tbl2\"" +
                " where \"measure1\" = '2'" +
                " group by \"dim1\"";

            expect(queryBuilder.buildReport(reportConfig).toString())
                .toEqual("select * from (" + tbl1Query + ") as \"t1\" inner join (" + tbl2Query + ") as \"t2\" on \"t1\".\"id1\" = \"t2\".\"id2\"");

        });

        it('query from two views, with custom filters', function () {

            var reportConfig = {
                "data_set": "set2",
                "dimensions": ['dim1'],
                "measures": ['measure1', 'measure2'],
                "parameters": {
                    "timezone_code": "EST",
                    "fromDate": "2015-12-1",
                    "toDate": "2015-12-10"
                },
                "filters": {
                    "measure1": [
                        {
                            "operator": "=",
                            "value": 2
                        }
                    ],
                    "dim1": [
                        {
                            "operator": "=",
                            "value": 2
                        },
                        {
                            "custom_filter": "DATE_RANGE",
                            "args": ["${fromDate}", "${toDate}", "${timezone_code}"]
                        }
                    ]
                },
                "sorts": []
            };


            var tbl1Query = "select (tbl1.field_name1 / NULLIF(tbl1.field_name2 * 1.0,0)) * 100," +
                " sum(tbl1.measure2) as measure2_alias," +
                " tbl1.dim1" +
                " from \"tbl1\"" +
                " where \"measure1\" = '2'" +
                " and \"dim1\" = '2'" +
                " and tbl1.dim1 >=  CONVERT_TIMEZONE('EST', 'UTC','2015-12-1')" +
                " and tbl1.dim1 < CONVERT_TIMEZONE('EST', 'UTC','2015-12-10'::date + INTERVAL '1 day')" +
                " group by \"dim1\"";

            var tbl2Query = "select (tbl2.field_name1 / NULLIF(tbl2.field_name2 * 1.0,0)) * 100," +
                " sum(tbl2.measure2) as measure2_alias" +
                " from \"tbl2\"" +
                " where \"measure1\" = '2'";

            expect(queryBuilder.buildReport(reportConfig).toString())
                .toEqual("select * from (" + tbl1Query + ") as \"t1\" inner join (" + tbl2Query + ") as \"t2\" on \"t1\".\"id1\" = \"t2\".\"id2\"");

        });

    });

    xdescribe('test report builder - On Redshift', function () {


        queryBuilder.setupConnector(connectionRedshift);

        xit('test campaigns query', function (done) {

            var reportConfig = {
                "data_set": "campaigns",
                "dimensions": ['datestart', 'campaignId'],
                "measures": ['ad_view'],
                "extra": ['name'],
                "filters": {
                    "campaignId": {
                        "operator": "=",
                        "value": 2037
                    },
                    "datestart": {
                        "operator": "=",
                        "value": "2015-12-10"
                    }
                },
                "sorts": []
            };
            queryBuilder.buildReport(reportConfig)
                .then(function (result) {
                    if (result) {
                        console.log(result);
                        done();
                    }
                });
        });

        xit('test dsps query', function (done) {

            var reportConfig = {
                "data_set": "dsps",
                "dimensions": ['dsp_stats.networkId', 'dsp_stats.providerId', 'dsp_stats.datestart'],
                "measures": ['dsp_stats.dsp_request', 'dsp_stats.dsp_response_nobids',
                    'dsp_stats.dsp_response', 'dsp_stats.dsp_request_items_count',
                    'dsp_stats.dsp_response_items_count', 'dsp_stats.campaign_serve',
                    'dsp_stats.fill_rate','dsp_stats.ad_view','dsp_stats.ad_click',
                    'dsp_stats.native_campaign','dsp_stats.advertisers_ecpm','dsp_stats.advertisers_ecpc'],
                "extra": ['dsps_data.name'],
                "parameters": {
                    "timezone_code": "US/Eastern",
                    "fromDate": "2015-12-10",
                    "toDate": "2015-12-10"
                    //"networkId": "3092"
                },
                "filters": {

                    "dsp_stats.providerId": [
                        {
                            "operator": ">",
                            "value": 0
                        }
                    ],
                    "dsp_stats.datestart": [
                        {
                            "custom_filter": "DATE_RANGE",
                            "args": ["${fromDate}", "${toDate}", "${timezone_code}"]
                        }
                    ]
                },

                "sortBy": [
                    {
                        "field": "dsp_stats.networkId",
                        "order": "asc"
                    },
                    {
                        "field": "dsp_stats.providerId"
                    },
                    {
                        "field": "dsp_stats.datestart"
                    }
                ]
            };
            queryBuilder.buildReport(reportConfig)
                .then(function (result) {
                    if (result) {
                        //console.log(result);
                        done();
                    }
                });

        }, 60000);

        it('test network traffic aggregation query', function (done) {

            var reportConfig = {
                "data_set": "networks_events",
                "dimensions": ['events.date','events.network_id'],
                "measures": ['events.widget_requests','events.page_views','events.widget_views','events.internal_clicks',
                    'events.paid_clicks','events.revenue','events.potential_impressions','events.served_impressions','events.campaigns_views','events.campaigns_clicks',
                    'events.campaigns_spend'
                ],
                "parameters": {
                    "timezone_code": "US/Eastern",
                    "fromDate": "2015-12-10",
                    "toDate": "2015-12-10",
                    "networkId": "3092"
                },
                "filters": {

                    "events.network_id": [
                        {
                            "operator": "=",
                            "value": "${networkId}"
                        }
                    ],
                    "events.date": [
                        {
                            "custom_filter": "DATE_RANGE",
                            "args": ["${fromDate}", "${toDate}", "${timezone_code}"]
                        }
                    ]
                },

                "sortBy": [
                    {
                        "field": "events.network_id",
                        "order": "asc"
                    },
                    {
                        "field": "events.date"
                    }
                ]
            };
            queryBuilder.buildReport(reportConfig)
                .then(function (result) {
                    if (result) {
                        //console.log(result);
                        done();
                    }
                });

        }, 60000);

    });


});