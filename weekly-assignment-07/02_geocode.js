'use strict';

// dependencies
const fs = require('fs'),
    querystring = require('querystring'),
    request = require('request'),
    async = require('async'),
    dotenv = require('dotenv');

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx';

// geocode addresses

let filename = 'data/m04_JSON.txt';
var aa = JSON.parse(fs.readFileSync(filename));

var input_street_address = [];

for (var i = 0; i < aa.meetings.length; i++) {
    input_street_address.push(aa.meetings[i].street_address);
}


let meetingsData = {
    meetings: []
};


// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(input_street_address, function(value, callback) {
        let query = {
            streetAddress: value,
            city: "New York",
            state: "NY",
            apikey: API_KEY,
            format: "json",
            version: "4.01"
        };

        // construct a querystring from the `query` object's values and append it to the api URL
        let apiRequest = API_URL + '?' + querystring.stringify(query);

        request(apiRequest, function(err, resp, body) {
            if (err) { throw err; }
            let tamuGeo = JSON.parse(body);
            console.log(tamuGeo['FeatureMatchingResultType'], apiRequest);
            meetingsData.meetings.push({
                address: tamuGeo['InputAddress']['StreetAddress'],
                lat: tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude'],
                lng: tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude']
            });

        });

        // sleep for a couple seconds before making the next request
        setTimeout(callback, 2000);
    },
    function() {
        fs.writeFileSync('data/m04.json', JSON.stringify(meetingsData));
        console.log('*** *** *** *** ***');
        console.log(`Number of meetings in this zone: ${meetingsData.meetings.length}`);
    });
