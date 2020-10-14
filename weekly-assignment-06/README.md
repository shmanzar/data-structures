
### Weekly Assignment 06 | Documentation | October 12th 2020

# Instructions
Instructions for this assignment can be found on the course [repo](https://github.com/visualizedata/data-structures/tree/master/weekly_assignment_06).

# Documentation
## Setup folders and relevant packages
I created two files, one for each part of the assignment: 1) `app_sql.js` , and 2) `app_dynamo.js`. I had already added this week’s entries to the process blog using the `addToDynamo.js` file. I copied by `.env` file in the directory to manage the numerous credentials in the code.


## Part One: Writing and executing a query for the AA data PostgreSQL

I began by using the code from *Week 04* and specifying a query which would select the existing data in my `aalocations` table in the PostgresSQL database and return some values.

```js
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_UN;
db_credentials.host = process.env.AWSRDS_HOST;
db_credentials.database = process.env.AWSRDS_DB;
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = process.env.AWSRDS_PORT;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// SQL statement to query meetings with addresses which include "46TH": 
var thisQuery = "SELECT address, lat, long FROM aalocations WHERE address ~* '46TH';";


```

I chose to select all the columns (`address, lat, long)` in table  `aalocations`  and filter them with PostgresSQL’s built-in regular expression capabilities. I used the regex `~*`  (which stands for match, case-insensitive) to only return data where the address contained the words `46TH`, signifying addresses located in 46th Street.

For more details on PostgresSQL’s regular expressions: [How to use Regex in SQL](https://dataschool.com/how-to-teach-people-sql/how-regex-works-in-sql/)

Then I ran the query on the database using: 

```js

client.query(thisQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);
        client.end();
    }
});
```


The resulting output gave a table (courtesy of the built-in  `console.table` function) returning all rows from the database which matched `46TH` in the address column:

![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-06/w06_sql_output.png)	
	


##  Part Two: Writing and executing a query for the Dear Diary data DynamoDB
Similar to the previous section, I began my using my *Week 05* DynamoDB code to set up a connection to the database: 
```js
const async = require('async');
var AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

```


I used a `params` object to construct the query. The `TableName` targets the `recipeDiary` table stored in the DynamoDB in *Week 05*.

The `KeyConditionExpression` specifies the query needed to return the data from the database. We want to get all data which have a `recipeID` (the partition key) of `10001` (denoting recipes from the excellent cookbook, /Nose to Tail/). For security purposes, the `recipeID` is masked behind additional keyword `bookID`. We use `datetime` (the sort key) to only select recipes which were made in the month of September. So we modify the `minDate` and `maxDate` accordingly and importantly, parse the dates as JS time objects converted into strings: 

```js 
var params = {
    TableName: "recipeDiary",
    KeyConditionExpression: "recipeID = :bookID and datetime between :minDate and :maxDate", // the query expression

    ExpressionAttributeValues: { // the query values
        ":bookID": { N: '10001' },
        ":minDate": { N: new Date("August 28, 2020").valueOf().toString() },
        ":maxDate": { N: new Date("September 30, 2020").valueOf().toString() }
    }
};
```

Running the above code threw the following error:

```js
Unable to query. Error: {
  "message": "Invalid KeyConditionExpression: Attribute name is a reserved keyword; reserved keyword: datetime",
  "code": "ValidationException",
  "time": "2020-10-14T04:53:36.249Z",
  "requestId": "QV9G9TK8MO6FUI17JA1G8V3MDFVV4KQNSO5AEMVJF66Q9ASUAAJG",
  "statusCode": 400,
  "retryable": false,
  "retryDelay": 13.409379731092397
}
```

It turns out `datetime`  is a *reserved keyword* in DynamoDB and hence we need to provide a *name substitution* (`ExpressionAttributeNames`) to get around the restrictions against using reserved words for attribute names. I change `datetime` to `#dt` which is the syntactical way of specifying a name substitution:

```js

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
```

The above code successfully returns the two recipes from *Nose to Tail* between *August 28 and September 30*: 

```js
Query succeeded.
***** ***** ***** ***** ***** 
 { recipeTitle: { S: 'Pork liver and leeks' },
  servings: { N: '6' },
  recipeID: { N: '10001' },
  ingredientList:
   { SS:
      [ 'brandy', 'butter', 'leeks', 'paprikka', 'pork liver', 'stock' ] },
  datetime: { N: '1601251200000' },
  rating: { N: '9' },
  book: { S: 'Nose to Tail' },
  month: { N: '8' },
  cuisine: { S: 'British' },
  author: { S: 'Fergus Henderson' } }
***** ***** ***** ***** ***** 
 { recipeTitle: { S: 'Roast bone marrow and parsely salad' },
  servings: { N: '2' },
  recipeID: { N: '10001' },
  ingredientList:
   { SS:
      [ 'Maldon salt',
        'capers',
        'olive oil',
        'parsely',
        'shallots',
        'toast',
        'veal marrowbones' ] },
  datetime: { N: '1601424000000' },
  rating: { N: '10' },
  book: { S: 'Nose to Tail' },
  month: { N: '8' },
  cuisine: { S: 'British' },
  author: { S: 'Fergus Henderson' } }
```

![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-06/w06_dynamo_output.png)	



## Final thoughts

I realise now that I must go back for the remainder of the data in the AA meetings. It is best to iterate once more on the schema of the SQL database I am using to store the meetings data.

I suspect for the process blog, the primary key and structure I am following now works but it will still do me good if I make a front-end mockup to see how users will interact with the recipe data, and then observe if the current keys still satisfy those requirements.