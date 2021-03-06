//connecting to the data-structures db
const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs')
const async = require('async');

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

var thisQuery = "SELECT * FROM aalocations";


client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});
