const async = require('async');
var AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "recipeDiary",
    KeyConditionExpression: "recipeID = :bookID and #dt between :minDate and :maxDate", // the query expression
    ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
        "#dt": "datetime"
    },
    ExpressionAttributeValues: { // the query values
        ":bookID": { N: '10001' },
        ":minDate": { N: new Date("August 28, 2020").valueOf().toString() },
        ":maxDate": { N: new Date("September 30, 2020").valueOf().toString() }
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    }
    else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});
