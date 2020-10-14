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

client.query(thisQuery, (err, res) => {
    if (err) { throw err }
    else {
        console.table(res.rows);
        client.end();
    }
});
