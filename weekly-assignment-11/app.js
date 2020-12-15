var express = require('express'),
    app = express();
const { Pool } = require('pg');
var AWS = require('aws-sdk');
const moment = require('moment-timezone');
const handlebars = require('handlebars');
var fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const indexSource = fs.readFileSync("templates/sensor.txt").toString();
var template = handlebars.compile(indexSource, { strict: true });

const pbSource = fs.readFileSync("templates/pb.txt").toString();
var pbtemplate = handlebars.compile(pbSource, { strict: true });

// AWS RDS credentials
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_UN;
db_credentials.host = process.env.AWSRDS_HOST;
db_credentials.database = process.env.AWSRDS_DB;
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = process.env.AWSRDS_PORT;

//<div id='map' style='width: 700px; height: 600px;'></div>
//       <script src='https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js'></script>
// <link href='https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css' rel='stylesheet' />

//         mapboxgl.accessToken = 'pk.eyJ1Ijoic21hbnphciIsImEiOiJja2k2ajRjaWowMXEyMnFxZ2IxbTRhaDkwIn0.bZyOlzap-1dfxKN_BHcCPw';
//     var map = new mapboxgl.Map({
//         container: 'map',
//         style: 'mapbox://styles/smanzar/cki6j8dxf3o2p19trqspv7hoh'
//     });
// << / script >
//   <script>

// create templates
var hx = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AA Meetings</title>
  <meta name="description" content="Meetings of AA in Manhattan">
  <meta name="author" content="AA">
  <link rel="stylesheet" href="css/style.css">
 <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
   integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
   crossorigin=""/>
   <style>#mapid { height: 880px; }</style>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
   integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
   crossorigin=""></script>
   
</head>

</head>
<body>

<h1>AA data endpoint</h1>
<div id="mapid"></div>

  <script>
  var data = 
  `;

var jx = `;


    var mymap = L.map('mapid').setView([40.734636,-73.994997], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'smanzar/cki6j8dxf3o2p19trqspv7hoh',
        accessToken: 'pk.eyJ1Ijoic21hbnphciIsImEiOiJja2k2ajRjaWowMXEyMnFxZ2IxbTRhaDkwIn0.bZyOlzap-1dfxKN_BHcCPw'
    }).addTo(mymap);
    for (var i=0; i<data.length; i++) {
        var lat = parseFloat(data[i].geocoord.slice(1,-1).split(',')[0].trim())
        var lon = parseFloat(data[i].geocoord.slice(1,-1).split(',')[1].trim())
        console.log([lat, lon])
        L.marker([lat, lon]).bindPopup(JSON.stringify(data[i])).addTo(mymap);
    }
    </script>
    </body>
    </html>`;

// L.marker( [data[i].lat, data[i].lon] ).bindPopup(JSON.stringify(data[i].address)).addTo(mymap);

app.get('/', function(req, res) {
    res.send('<h3>SM Code demo site</h3><ul><li><a href="/aa">aa meetings</a></li><li><a href="/temperature">temp sensor</a></li><li><a href="/processblog">process blog</a></li></ul>');
});

// respond to requests for /aa
app.get('/aa', function(req, res) {

    var now = moment.tz(Date.now(), "America/New_York");
    // var dayy = now.format('dddd').toString() + 's';
    var dayy = "'" + now.format('dddd').toString() + "s'" //POSTGRES gotcha: NEED TO WRAP single quotes with doubles
    var hourr = now.format('h:mmA').toString();
    console.log(dayy)

    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query 

    var thisQuery = `SELECT geocoord, json_agg(json_build_object('loc', building_name, 'address', address, 'time', endtime, 'name', meeting_name, 'types', meeting_typename, 'shour', starttime, 'day', weekday)) as meetings 
    FROM aalocations 
    WHERE weekday = ` + dayy +
        ` GROUP BY geocoord
        ;`;
    console.log(thisQuery)
    // var thisQuery = `SELECT *, json_agg(json_build_object('loc', building_name, 'address', address, 'time', endtime, 'name', meeting_name, 'day', weekday, 'types', meeting_typename, 'shour', starttime)) as meetings FROM aalocations WHERE day = ` + dayy + 'and shour >= ' + hourr +
    //     `GROUP BY geocoord.latlong;`;

    // var thisQuery = `SELECT geocoord FROM aalocations`;

    client.query(thisQuery, (qerr, qres) => {
        if (qerr) { throw qerr }

        else {
            // console.log(JSON.stringify(qres.rows))
            var resp = hx + JSON.stringify(qres.rows) + jx;
            res.send(resp);
            client.end();
            console.log('2) responded to request for aa meeting data');
        }
    });
});


app.get('/temperature', function(req, res) {

    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query 
    var q = `SELECT EXTRACT(DAY FROM sensorTime) as sensorday,
             MIN(tempValue::int) as num_obs
             FROM sensorData
             GROUP BY sensorday
             ORDER BY sensorday;`;

    client.connect();
    client.query(q, (qerr, qres) => {
        if (qerr) { throw qerr }
        else {
            res.end(template({ sensordata: JSON.stringify(qres.rows) }));
            client.end();
            console.log('1) responded to request for sensor graph');
        }
    });
});

app.get('/processblog', function(req, res) {
    // AWS DynamoDB credentials
    AWS.config = new AWS.Config();
    AWS.config.region = "us-east-1";

    // Connect to the AWS DynamoDB database
    var dynamodb = new AWS.DynamoDB();

    // DynamoDB (NoSQL) query
    var params = {
        TableName: "recipeDiary",
        KeyConditionExpression: "recipeID = :bookID", // the query expression
        ExpressionAttributeValues: { // the query values
            ":bookID": { N: '10001' }
        }
    };

    dynamodb.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            throw (err);
        }
        else {
            res.end(pbtemplate({ pbdata: JSON.stringify(data.Items) }));
            console.log('3) responded to request for process blog data');
        }
    });
});

// serve static files in /public
app.use(express.static('public'));

app.use(function(req, res, next) {
    res.status(404).send("Sorry can't find that!");
});

// listen on port 8080
var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Server listening...');
});