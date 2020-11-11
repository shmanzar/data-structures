# Weekly Assignment 9


### Weekly Assignment 09 | Documentation | November 5th 2020

# Instructions

Instructions for this assignment can be found on the course [repo](https://github.com/visualizedata/data-structures/tree/master/weekly_assignment_09).

# Documentation
## Setup folders and relevant packages

Since I needed to first connect to my Postgres database, I put in all of my credentials in `.env` file and the referenced them in a `db_credentials` object:
I also stored the relevant credentials from the OpenWeather API I wanted to use in this assignment.

I installed the `pm2` NPM package to use it as a process manager and run the API queries indefinitely.

## Database structure

![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-09/w09_datamodel.jpeg)



I will store all the temperature and humidity related data being recorded by the Particle board and DHT sensor in one table called `sensorData`. The other table, `owData`, will store the whatever weather data was available for my neighbourhood at the time that the sensor data was being recorded. 
So I should end up with two tables having minute-by-minute record of the weather conditions both inside and outside apartment. 

## Creating the tables in the PostgresSQL database (01_setup.js)
Similar to `weekly-assignment-04`, we set up the script so we can access it using our `.env` file:

``` javascript
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

```

We run two queries to create tables in the database. The tables match the structure laid out in the last section. We want the current temperature and humidity readings from the sensor and two derived readings (dew-point and heat index value) alongside the time at which they recorded to the database.

We want to get the same values from the OpenWeather API about the outside of my apartment:


``` javascript
var sensorQuery = "CREATE TABLE sensorData ( tempValue double precision, humValue double precision, dpValue double precision, hixValue double precision, sensorTime timestamp DEFAULT current_timestamp );";

var owQuery = "CREATE TABLE owData ( description varchar(10000), icon varchar(1000), tempC double precision, feelsTemp double precision, tempMin double precision, tempMax double precision, pressure double precision, humidity double precision, windSpeed double precision, windDegree double precision, clouds double precision, dateTime varchar(10000), status varchar(1000), apiTime timestamp DEFAULT current_timestamp );";

client.query(sensorQuery, (err, res) => {
    console.log(err, res);
});

client.query(owQuery, (err, res) => {
    console.log(err, res);
    client.end();
});

```


## Linking the sensor and the database (02_worker.js):
Next,  we first connect the Particle (the microcontroller board) to the internet and configure it using the CLI:

```bash
particle cloud login

? Please enter your email address: smanzar@newschool.edu
? Please enter your password [hidden]
> Successfully completed login!


```

Then, we create a token for ourselves so we can access the it over an API:

`particle token create --never-expires`



 We now create the relevant environment variables for the Particle device and construct the API queries to it and the OpenWeather API:

```javascript

// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var particle_variable = 'myReadings';


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

```



Lastly, we create two functions called `getAndWriteData()` and `getWeather()`. The first one queries the sensor’s API and gets a JSON object with the sensor readings. We clean it to get our required readings and the connect to our database and insert them in the relevant columns.

The second function does the same but for the OpenWeather API. The functions then are called using the `setInterval()` function which allows them to be run periodically, twice every minute and every minute, respectively.

```javascript
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

```


## Using `pm2` to manage the running the script indefinitely:
We use `pm2` to  run the `02_worker.js` continuously. After installing `pm2`, we first configure the `ecosystem.config.js` file to include our API keys and credentials, and to target our `02_worker.js` file. Then, we use the command `pm2 start ecosystem.config.js` to run our targeted script with all of the credentials indefinitely.



## Review the database entries:


We query the entered data and the counts to gauge if the script is running properly:



```javascript
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
```


The result from the sensorData table:

![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-09/sensorData_screenshot.png)



and finally, the result from the owData table:


![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-09/owData_screenshot.png)




