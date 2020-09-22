### Weekly Assignment 03 | Documentation | September 17th 2020

# Instructions

In preparation for this assignment, [create a free account with Texas A&M GeoServices](https://geoservices.tamu.edu/Signup/). 

Continue work on the file you parsed in Weekly Assignment 2. If you haven't already, organize your data into a mixture of Objects and Arrays that can be [‘parsed’ and ‘stringified’](https://nodejs.org/en/knowledge/javascript-conventions/what-is-json/) as [JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) so that it will be easier to access the data for your work on this assignment. Since you’ll be assembling a list of many results, your best bet is to first create an (empty) array and then add items to it one at a time. You can use the Array object’s [push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push) method for this.

Write a script that makes a request to the [Texas A&M Geoservices Geocoding APIs](http://geoservices.tamu.edu/Services/Geocode/WebService/) for each address, using the address data you parsed in Weekly Assignment 2. You'll need to do some work on the address data (using code!) to prepare them for the API queries. For example, the parsed value `50 Perry Street, Ground Floor,` should be modified to `50 Perry Street, New York, NY`. The addresses are messy and may yield weird results from the API response. Don't worry too much about this right now. But, start to think about it; in a later assignment we'll have to clean these up.  

Your final output should be a `.json` **file** that contains an **array** that contains an **object** for each meeting (which may or may not nest other arrays and objects). The array should have a length equal to the number of meetings. Each object should hold the relevant data for each meeting. For now, we're focusing on the addresses and geographic coordinates. An example:  
```js
[ 
  { address: '63 Fifth Ave, New York, NY', latLong: { lat: 40.7353041, lng: -73.99413539999999 } },
  { address: '16 E 16th St, New York, NY', latLong: { lat: 40.736765, lng: -73.9919024 } },
  { address: '2 W 13th St, New York, NY', latLong: { lat: 40.7353297, lng: -73.99447889999999 } } 
]
```

Be mindful of:  
* API rate limits (you get 2,500 requests total before needing to pay TAMU for more)  
* Asyncronous JavaScript (but don't overuse `setTimeout`)  
* Keeping your API key(s) off of GitHub (use an [environment variable](https://www.npmjs.com/package/dotenv) instead)  
* Keeping only the data you need from the API response, not all the data  

Update your GitHub repository with the relevant file(s). In Canvas, submit the URL of the specific location of this work within your `data-structures` GitHub repository. 

## Starter code

### Setting environment variables using npm `dotenv`

Environment variables help keep APIs secret (and off of GitHub!). There are several ways to create and manage environment variables; I recommend [`dotenv`](https://www.npmjs.com/package/dotenv).  

Here are the steps to set this up: 

1. In the root directory of your Cloud9 workspace (e.g. `/home/ec2-user/environment`), create a new file named `.env` with the following Linux command: `touch .env`  
2. Open the new `.env` file by double clicking the file name in the Cloud 9 abstraction of the root directory structure.  
3. In this file, you may assign new environment variables. No spaces are permitted in variables assignments (unless in a text string) and each new variable assignment should be on a new line (with no blank lines in between). For example, you could create two new environment variables with:
> ```ini
> NEW_VAR="Content of NEW_VAR variable"
> MYPASSWORD="ilovemykitties"
> ```
4. **IMPORTANT: your `.env` file should NEVER, EVER end up on GitHub.** One way to manage this is by [creating a local `.gitignore` file](https://help.github.com/en/articles/ignoring-files). This file will eventually contain all your API Keys, which should be treated as carefully as you treat passwords, credit card numbers, and family secrets. Guard it with your life. 

To access, these variables, you will use `process.env` to access the environment variables created by the `dotenv` package, as demonstrated in the starter code: 

### Install dependencies
```console
npm install request async dotenv
```

### Node.js script

```javascript
"use strict"

// dependencies
const fs = require('fs'),
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv');

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx'

// geocode addresses
let meetingsData = [];
let addresses = ["63 Fifth Ave", "16 E 16th St", "2 W 13th St"];

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
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
        if (err){ throw err; }

        let tamuGeo = JSON.parse(body);
        console.log(tamuGeo['FeatureMatchingResultType'], apiRequest);
        meetingsData.push(tamuGeo);
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
}, function() {
    fs.writeFileSync('data/first.json', JSON.stringify(meetingsData));
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings in this zone: ${meetingsData.length}`);
});
```



# Documentation

### Setup folders and relevant packages

I copied the `m04_JSON.txt` file to the `data` folder in this week’s folder in the repo and installed the NPM packages `requests`, `async`, and  `dotenv` which will be required for this week’s tasks. I call them in my working file `app.js` and assign them variables to make accessing them easier.

```javascript

// dependencies
const fs = require('fs'),
    querystring = require('querystring'),
    request = require('request'),
    async = require('async'),
    dotenv = require('dotenv');

```

### Set up API keys and `.env` file

I made an account at [Texas A&M Geoservices Geocoding APIs](http://geoservices.tamu.edu/Services/Geocode/WebService/) to receive a key to access their geocoding API. I entered the credentials in an `.env` file and used the `dotenv` package to configure it so it can be accessed in the code without hardcoding it in the script:

```javascript

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx'

```

### Parse and access the street addresses in the JSON string

My  `m04_JSON.txt`  file has the JSON string containing the meetings data parsed in last week’s assignment. I read and parse it into a JSON object, `aa` , using `JSON.parse()` function. 

The `aa` object, as of now, contains meeting names, the street addresses, and a numeric ID. As I need just the street addresses for the API calls, I push them into a new array called `input_street_address`.

```javascript
let filename = 'data/m04_JSON.txt'
var aa = JSON.parse(fs.readFileSync(filename));

var input_street_address = []
for (var i = 0; i < aa.meetings.length; i++) {
    input_street_address.push(aa.meetings[i].street_address)
}
```

### Choosing a data structure for the returning geocoded data

After going through the starter code and the resulting JSON response, I decided that it will best to use an Object to store the incoming data from the API. I create a `meetingsData` object with an array inclosed called `meetings`  to be able to store the street addresses and the incoming location data:

```javascript
let meetingsData = {
    meetings: []
};
```


###  Building a query the API for the location data 

I observed the resulting response from the starter code and determined that my `input_street_address` array can be more or less plugged inside the existing `eachSeries` function:

```javascript
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
...
...
...
```

`async.eachSeries` iterates over each element of an array runs while taking javascript’s asynchronous nature into account. The starter code also used the package `querystring` to parse our API requests (`apiRequest`) into syntactically correct calls from the object we created in `query`. Again, I found that it works as is for my code and did not require any changes.


###  Making requests to the API and parsing the incoming data 

The starter code’s `request` functions results in a JSON response with  an extensive data dump (see Sample Response in Starter Code).
I need to push only relevant bits to my `meetingsData` object’s `meetings` array:

```javascript
    request(apiRequest, function(err, resp, body) {
        if (err){ throw err; }

        let tamuGeo = JSON.parse(body);
        console.log(tamuGeo['FeatureMatchingResultType'], apiRequest);
               meetingsData.meetings.push({
                    address: tamuGeo['InputAddress']['StreetAddress'],
                    lat: tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude'],
                    lng: tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude']
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
}, 
...
...
...
```

I request the API against each street address and then push only the addresses and the location data (`lat`, `long`) in to the `meetingsData` object . Every request is lagged by two seconds using the `setTimeout` function so as to remain within the API’s limits.

The `meetingsData` populates with the location data:

```javascript
{ meetings:
   [ { address: '252 W 46TH ST New York NY ',
       lat: '40.7593831',
       lng: '-73.9872329' },
     { address: '303 W 42ND ST New York NY ',
       lat: '40.7575385',
       lng: '-73.9901368' },
     { address: '303 W 42ND ST New York NY ',
       lat: '40.7575385',
       lng: '-73.9901368' },
     { address: '305 7TH AVE New York NY ',
       lat: '40.7467107',
       lng: '-73.9935208' },
     { address: '1 W 53RD ST New York NY ',
       lat: '40.7608523',
       lng: '-73.9765938' },
     { address: '303 W 42ND ST New York NY ',
       lat: '40.7575385',
       lng: '-73.9901368' },
...
...
...
```


### Store the object into a JSON file

Finally, I use the `writeFileSync()` function to store the `meetingsData` object into a JSON (`m04.json`) after passing it through `JSON.stringify()`.


```javascript
...
...
    function() {
        fs.writeFileSync('data/m04.json', JSON.stringify(meetingsData));
        console.log(meetingsData);

        console.log('*** *** *** *** ***');
        console.log(`Number of meetings in this zone: ${meetingsData.meetings.length}`);
    });


```


I am able to store all 53 addresses with their location successfully:

### Final notes:

I tested some of the location data sent by the API, and some of them are not exact matches. In fact, in one my iterations, I was matched a Manhattan address (133 West 46th Street) in Crown Heights (`40.6639307188879,-73.9382749875207`). The API's response `InputAddress`[`StreetAddress`] shows `"13320 WEST2046TH20STREET New%20York NY`.

This shows that the `querystring` package was not successful in parsing the calls we created from the API; it added the special space character of `%20` into the actual address.

I wonder if the `MatchScore` in the API response provides an estimate of the accuracy of the results. This also makes a case to parse the zip codes and pass it into the API calls.


Lastly, I would also want to create a better object structure which can retain all the of the information I parse from the web page and can be updated with the newly acquired data from the API - something more akin to how live database works with updates queries.

