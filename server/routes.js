/**
 * Created by yotam on 6/1/2016.
 */
var config = require('./config');
var builder = require('./../engine/index');

var routes = {
    setRoutes : function(app, express) {
        /*app.get('/', function(req, res){
         res.sendFile(__dirname + '/static/index.html');
         });*/
        app.post('/init', function(req, res){
            console.log(req.body);
            builder.setupDataModels(req.body);

            res.sendStatus(200);
        });
        app.all('/*', function (req, res){
            res.render(config.CLIENT_DIST_INDEX );
        });
    }
};
module.exports = routes;
