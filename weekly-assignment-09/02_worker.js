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

// openWeather API URL to get current weather data
var ow_url = 'http://api.openweathermap.org/data/2.5/weather?lat=40.6362296&lon=-74.0254909&units=metric&appid=' + process.env.OW_KEY;

// console.log(device_url)


// initialise sensor variables
var humidity = 0;
var temp_c = 0;
var dp = 0;
var heat_index = 0;


// initialise OpenWeather API variables

var ow_description = '';
var ow_icon = '';
var ow_temp_c = 0;
var ow_feels_temp = 0;
var ow_temp_min = 0;
var ow_temp_max = 0;
var ow_temp_pressure = 0;
var ow_humid = 0;
var ow_wind_speed = 0;
var ow_wind_deg = 0;
var own_clouds = 0;
var ow_reading_dt = 0;
var ow_status = 0;



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

// Make request to the OpenWeather API to get weather values

var getWeather = function() {
    request(ow_url, function(error, response, body) {
        var res = JSON.parse(body);

        // Store weather api value(s) in variables

        ow_description = res.weather[0].main;
        ow_icon = res.weather[0].icon;
        ow_temp_c = res.main.temp;
        ow_feels_temp = res.main.feels_like;
        ow_temp_min = res.main.temp_min;
        ow_temp_max = res.main.temp_max;
        ow_temp_pressure = res.main.pressure;
        ow_humid = res.main.humidity;
        ow_wind_speed = res.wind.speed;
        ow_wind_deg = res.wind.deg;
        own_clouds = res.clouds.all;
        ow_reading_dt = res.dt;
        ow_status = res.cod

        // var sv = JSON.parse(body).weather[0].main;
        console.log(ow_description, ow_icon, ow_temp_c, ow_feels_temp, ow_temp_max, ow_temp_pressure, ow_humid, ow_wind_deg, ow_temp_min, ow_wind_speed, own_clouds, ow_status, ow_reading_dt);

        // Connect to the AWS RDS Postgres database

        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table
        var thisQuery = "INSERT INTO owData VALUES (E'" + ow_description + "', E'" + ow_icon + "', " + ow_temp_c + ", " + ow_feels_temp + ", " + ow_temp_min + ", " + ow_temp_max + ", " + ow_temp_pressure + ", " + ow_humid + ", " + ow_wind_speed + ", " + ow_wind_deg + ", " + own_clouds + ", " + ow_reading_dt + ", " + ow_status + ");";
        console.log(thisQuery);
        // error reporting
        if (error) {
            console.log(error)
            ow_status = error;
        }

        // Connect to the AWS RDS Postgres database and insert a new row of weatherapi values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    })

}


setInterval(getAndWriteData, 30000)

setInterval(getWeather, 60000)
