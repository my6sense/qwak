/**
 * DataQueryController
 *
 * @description :: Server-side logic for managing Dataqueries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var queryEngine = require('./../../../../../engine/index');
var q = require('q');
function getDataModels(){
  return q.all([
    DataView.find(),
    DataSet.find(),
    DataSource.find(),
  ]);
}
module.exports = {
	run : function(req, res){
    console.log("Running report..");
    getDataModels().spread(function(dataViews, dataSets, dataSources){
      var dataModels = {
        dataViews : dataViews,
        dataSets : dataSets,
        dataSources : dataSources,
      }
      queryEngine.setupDataModels(dataModels);
      queryEngine.buildReport(req.body).then(function(result){
        res.json(200,result);
      },function(err){
        res.json(500,error);

      });
    });

  }
};

