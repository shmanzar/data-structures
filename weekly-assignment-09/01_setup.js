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

// Sample SQL statement to create a table: 
var thisQuery = "CREATE TABLE sensorData ( tempValue double precision, humValue double precision, dpValue double precision, hixValue double precision, sensorTime timestamp DEFAULT current_timestamp );";

var thisQuery = "CREATE TABLE owData ( description varchar(10000), icon varchar(1000), tempC double precision, feelsTemp double precision, tempMin double precision, tempMax double precision, pressure double precision, humidity double precision, windSpeed double precision, windDegree double precision, clouds double precision, dateTime varchar(10000), status varchar(1000), apiTime timestamp DEFAULT current_timestamp );";

// var thisQuery = "SELECT * FROM owData;";

// var thisQuery = 'DROP TABLE owData;'


// var thisQuery = 'DROP TABLE sensorData;'

client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});
