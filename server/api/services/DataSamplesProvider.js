/**
 * Created by yotam on 8/1/2016.
 */
var fs = require("fs");
var q = require("q");
module.exports = {

    init: function (options) {
        var deferred = q.defer();
        var data = [];
        var file = "test.db";
        var exists = fs.existsSync(file);

        if (!exists) {
            console.log("Creating DB file.");
            fs.openSync(file, "w");
        }

        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);

        db.serialize(function () {

                db.run("DROP TABLE IF EXISTS Events");
                db.run("CREATE TABLE Events (id INT, measure1 INT)");
                db.all("SELECT * FROM sqlite_master WHERE type='table';", [], function(err, data){
                    console.log("tables:", data);

                });

            var stmt = db.prepare("INSERT INTO Events VALUES (?,?)");

            //Insert random data
            var rnd;
            for (var i = 0; i < 10; i++) {
                rnd = Math.floor(Math.random() * 10000000);
                stmt.run([i, rnd]);
            }

            stmt.finalize();
            db.all("SELECT * FROM Events;", [], function (err, data) {
                console.log(err);
                console.log(data);
                deferred.resolve(data);
            });
        });

        db.close();

        return deferred.promise;
    },


};