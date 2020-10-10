# Weekly Assignment 6

You're going to continue working with the AA data in your PostgreSQL database and the Dear Diary data in DynamoDB. You will write and execute queries for both. 

## Part One: Write and execute a [query](https://www.postgresql.org/docs/9.4/queries.html) for your AA data PostgreSQL

Data with the same format as shown in [**this sample**](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_06/data/aa_sample.csv) was added to a table in PostgreSQL in AWS (like you did in [Weekly Assignment 4](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04.md)). It was written to a table created with this SQL statement:  
`CREATE TABLE aadata (mtgday varchar(25), mtgtime  varchar(25), mtghour int, mtglocation varchar(75), mtgaddress varchar(75), mtgregion varchar(75), mtgtypes varchar(150));`

For **part one** of this assignment, write and execute a [SQL query](https://www.postgresql.org/docs/9.4/queries.html) for your AA data to filter meetings based on parameters that would make sense for your planned map. [[helpful SQL query overview](https://beginner-sql-tutorial.com/sql-select-statement.htm)]

#### Starter Code: 

```javascript
const { Client } = require('pg');
const cTable = require('console.table');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'aaron';
db_credentials.host = 'aa2020.c2g7qw1juwkg.us-east-1.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query meetings on Monday that start on or after 7:00pm: 
var thisQuery = "SELECT mtgday, mtgtime, mtglocation, mtgaddress, mtgtypes FROM aadata WHERE mtgday = 'Monday' and mtghour >= 19;";

client.query(thisQuery, (err, res) => {
    if (err) {throw err}
    else {
        console.table(res.rows);
        client.end();
    }
});
```

Here are a few lines of the output to the console: 

```
Monday  19:00     Bethlehem Lutheran Church                      6935 4th Ave                      Beginner                                                 
Monday  19:00     Bishop Malloy Civic Center                     15 Parkside Rd Dr                 Beginner, Wheelchair Access                              
Monday  19:00     Blessed Virgin Mary Help of Christians Church  70-31 48th Ave                    Beginner                                                 
Monday  19:00     Bronxville Lutheran Chapel School              172 White Plains Rd               Closed, Wheelchair Access, Women                         
Monday  19:00     Christ the King Church                         141 Marcy Pl                      Beginner, Wheelchair Access                    
```

## Part Two: Write and execute a [query](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) for your Dear Diary data DynamoDB

**[This data](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_06/addToDynamo.js)** was added to a "table" in DynamoDB in AWS (like you did in [Weekly Assignment 5](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_05.md)). 

For **part two** of this assignment, write and execute a [NoSQL query](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) for your Dear Diary data in DynamoDB to filter diary entries based on parameters that would make sense for your interface. 

In DynamoDB, a query heavily depends on what you have named as the [primary key(s)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey). **Partition key(s) must be unique.** In the "table" below, a *composite primary key* has been used, with `topic` as the *partition key* and `dt` as the *sort key*. Other *items* can be used to filter data, but only after the partition key or keys have been used. 

#### Starter Code: 

```javascript
// npm install aws-sdk
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "aaronprocessblog",
    KeyConditionExpression: "#tp = :topicName and dt between :minDate and :maxDate", // the query expression
    ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
        "#tp" : "topic"
    },
    ExpressionAttributeValues: { // the query values
        ":topicName": {S: "work"},
        ":minDate": {N: new Date("August 28, 2020").valueOf().toString()},
        ":maxDate": {N: new Date("December 11, 2020").valueOf().toString()}
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});
```

## Submission requirements

Update your GitHub repository with the relevant file(s). In Canvas, submit the URL of the specific location of this work within your `data-structures` GitHub repository. 
