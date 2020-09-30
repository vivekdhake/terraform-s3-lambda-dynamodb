    const doc = require('dynamodb-doc');
    const dynamo = new doc.DynamoDB();  
    const AWS = require('aws-sdk');
    const S3 = new AWS.S3({
        maxRetries: 0,
        region: 'us-east',
    });
    
    const insertSuccess = 0;
    const insertErrors = 0;
    
    function dynamoResultCallback(err, data) {
        if (err) {
            insertErrors++;
            console.log("Insert Error: \n" + err);
            //console.log(err, err.stack); // an error occurred
        } else {
            insertSuccess++;
        }
    }

    //CONVERT TO JSON FUNCTION
    function csvJSON(csv){
        var lines=csv.split('\r');
        for(var i = 0; i<lines.length; i++){
            lines[i] = lines[i].replace(/\s/,'');//delete all blanks
        }
        var result = [];
        var headers=lines[0].split(",");
       
        for(var i=1;i<lines.length;i++){
            var obj = {};
            var currentline=lines[i].split(",");
            for(var j=0;j<headers.length;j++){
                //IF OBJECT KEY HAS NO VALUE, 
                //REMOVE IT OR DYNAMO DB WILL ERROR ON THAT OBJECT
                if(currentline[j]!==''){
                   obj[headers[j].toString()] = currentline[j];
                }
            }
          result.push(obj);
        }
        return result; //JavaScript object
        // JSON.stringify(result); //JSON
    }
    
    exports.handler = (event, context, callback) => {

        var srcBucket = event.Records[0].s3.bucket.name;
        var srcKey = event.Records[0].s3.object.key;
    
        S3.getObject({
            Bucket: srcBucket,
            Key: srcKey,
        }, function(err, data) {
            if (err !== null) {
                
                return callback(err, null);
            }
            var fileData = data.Body.toString('utf-8');            
            var obj = csvJSON(fileData);
            
            var string = JSON.stringify(obj);
            console.log(string);
            
            for (var i = 0; i < obj.length; i++) {
                
                console.log('adding '+ JSON.stringify(obj[i]));
                 
                var params = {
                    Item: obj[i],
                    TableName: "employee"
                };
                dynamo.putItem(params, dynamoResultCallback);
            }
            return callback(null, data);
        });
    };
