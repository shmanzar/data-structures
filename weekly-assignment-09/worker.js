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

// var test_device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + 'events' + '?access_token=' + access_token;
// var test_device_url = "https://api.particle.io/v1/devices/" + device_id + "/events/?access_token=" + access_token;






console.log(device_url)

var writeTest = function() {
    request(device_url, function(error, response, body) {

        console.log(body)
        // Store sensor value(s) in a variable
        // var sv = JSON.parse(body).result;
        var sv = JSON.parse(body).result;

        console.log(sv)
    })
}

setInterval(writeTest, 10000)
