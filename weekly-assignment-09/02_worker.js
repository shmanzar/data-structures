var request = require('request');
const { Client } = require('pg');
const dotenv = require('dotenv');
const got = require('got');

dotenv.config();


// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var particle_variable = 'myReadings';


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



var device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + particle_variable + '?access_token=' + access_token;

// console.log(device_url)

var humidity = 0;
var temp_c = 0;
var dp = 0;
var heat_index = 0;

// Make request to the Particle API to get sensor values
var getAndWriteData = function() {
    request(device_url, function(error, response, body) {
        var sv = JSON.parse(body).result;


        //cleaning up the string recieved from the sensor

        sv = sv.replace(/{|}/g, "")
        sv = sv.split(',')

        // Store sensor value(s) in variables

        humidity = sv[0].match(/[+-]?([0-9]*[.])?[0-9]+/g)[0]
        temp_c = sv[1].match(/[+-]?([0-9]*[.])?[0-9]+/g)[0]
        dp = sv[2].match(/[+-]?([0-9]*[.])?[0-9]+/g)[0]
        heat_index = sv[3].match(/[+-]?([0-9]*[.])?[0-9]+/g)[0]


        // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table

        // var thisQuery = "INSERT INTO sensorData VALUES (E'" + temp_c + "', " + humidity + ", " + dp + ", " + heat_index + ");";

        var thisQuery = "INSERT INTO sensorData VALUES (E'" + temp_c + "', " + humidity + ", " + dp + ", " + heat_index + ", DEFAULT);";

        console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    })
}

setInterval(getAndWriteData, 20000)
