/**
 * Created by yotam on 8/1/2016.
 */
var storage = require('filestorage').create('/path/to/directory/');
var filesManager = function(){
    return {
        /**
         *
         */
        create : function(content,metadata){
            //storage.insert(name, buffer, [custom], [fnCallback], [changelog]);
            storage.insert('view1', '/files/models/views/view1.json', '{"yoo" : 1}', function(err, id, stat) {

                console.log(id);
                console.log(stat);

                // stat.name        - file name
                // stat.extension   - file extension
                // stat.length      - file length
                // stat.type        - content type
                // stat.width       - picture width
                // stat.height      - picture height
                // stat.custom      - your custom value
                // stat.stamp       - date created ticks, new Date(stat.stamp)

            }, 'new logo');
        },
        update : function(content,metadata){

        },
        getById : function(){

        },
        remove: function(){

        }

    }
};