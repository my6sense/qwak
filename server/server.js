/**
 * Created by yotam on 6/1/2016.
 */
var express = require('express');
var app = express();
var routes = require('./routes');
var config = require('./config');

app.engine('html', require('ejs').renderFile);
app.use('/', express.static(config.CLIENT_DIST));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
routes.setRoutes(app, express);

app.listen(config.PORT,function(){
    console.log("listening on "+ config.PORT);
});