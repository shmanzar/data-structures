const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs')

// const cTable = require('console.table');
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

// Sample SQL statements for checking your work: 
var thisQuery = "SELECT * FROM sensorData;"; // print all values
var secondQuery = "SELECT COUNT (*) FROM sensorData;"; // print the number of rows
var thirdQuery = "SELECT tempValue, COUNT (*) FROM sensorData GROUP BY tempValue;"; // print the number of rows for each sensorValue
var fourthQuery = "SELECT * FROM owData;"; // print all values
var fifthQuery = "SELECT COUNT (*) FROM owData;"; // print the number of rows

client.query(thisQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);


    }
});

client.query(secondQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);
    }
});

client.query(thirdQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);
    }
});

client.query(fourthQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);
    }
});

client.query(fifthQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);
    }
    client.end();
});
