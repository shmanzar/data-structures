### Weekly Assignment 04 | Documentation | September 24th 2020

 Instructions
You’re going to continue working with the data you scraped, parsed, and augmented in the previous three assignments. In this assignment, you will write your AA data to a relational database.

Using the Hills text as a starting point (but feel free to strike out on your own), draw a data model for the AA meetings data to be stored in a database. Include all the content/data/variables from the source file that you believe to be relevant, even if you haven’t parsed it yet. Upload an image (png format) of your drawing to your GitHub repository.
Some decisions that will help with this drawing:
1. Will you use a  [Normalized Data Model or a Denormalized Data Model](https://www.quora.com/What-is-normalized-vs-denormalized-data) ? Why?
2. When the data comes back out of the database, how should it be structured? Why?
3. How would you describe the hierarchy of the data?



# Documentation
## Setup folders and relevant packages
I created an PostgreSQL database on AWS RDS and connected it to my Cloud9 environment.  

I moved the JSON data file `m04.json` from last week into this week’s data folder and also installed the NPM package `pg` to interact with the PostgreSQL database in node.


## Part One: Plan
I plan to use a normalised data model for the source data. This means that I envisage that the data is structured into multiple tables which are linked together via _primary keys (PK)_ and foreign keys (FK). The former uniquely identify entries _within_ a table and the latter uniquely links them with other tables. I have three tables `location`, `details` and `meeting` .

![Data Model for AA Meetings Database](https://github.com/shmanzar/data-structures/tree/master/weekly-assignment-04/w04_datamodel_001.png)

([Data Model for AA Meetings Database](https://github.com/shmanzar/data-structures/tree/master/weekly-assignment-04/w04_datamodel_001.png))

When retrieved from the database, the data should be structured as a JSON object with the unique key identifiers combining the relevant data from all three tables into one.




## Part Two: Create a table(s) in your database (`wa04a.js`)

Since I needed to first connect to my Postgres database, I put in all of my credentials in `.env` file and the referenced them in a `db_credentials` object:

```javascript
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

```

I then create `client` object to connect to Postgres database hosted in AWS using the `pg` package:

```javascript
// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();
```

Then, I use a SQL query `thisQuery` to create a table called `allocations` with an `address`, `lat` and `long` column:

```javascript
var thisQuery = "CREATE TABLE aalocations (address varchar(100), lat double precision, long double precision);";
```

The `address column` has a denoted length of 100 characters while `lat` and `long` have been specified to be doubles or large floating point values with high precision.

Running this query using the client object results in the table being created in the database: 

```javascript
client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});
```


## Part Three: Populate your database (`wa04b.js`)

We set up this file with the required packages, credentials and `client` object as before.

But as we now want to use our last week’s JSON object to populate our database, we first read the JSON object in variable called `meetings_data`:

```javascript
let filename = 'data/m04.json';
var aa_data = JSON.parse(fs.readFileSync(filename));

var meetings_data = aa_data.meetings
```

Next, we used `async.eachSeries` to iterate over the `meetings_data` object and call the query `INSERT INTO allocations VALUES (E'" + value.address + "', " + value.lat + ", " + value.lng + “);”` on each element of the object. The query simply puts the address and locations data into the `aalocations` table and its corresponding columns. The code is timeout each second to allow the RDS API to respond in time:


```javascript

async.eachSeries(meetings_data, function(value, callback) {
    const client = new Client(db_credentials);
    client.connect();
    var thisQuery = "INSERT INTO aalocations VALUES (E'" + value.address + "', " + value.lat + ", " + value.lng + ");";
    client.query(thisQuery, (err, res) => {
        console.log(err, res);
        client.end();
    });
    setTimeout(callback, 1000);
});

```

We receive a non-error message showing that elements have been inserted into the database.

## Check and confirm entries (`wa04c.js`)
Finally, in the is last file, we again set up this file with the required packages, credentials and `client` object as before.

And this time, using the query ` SELECT * FROM aalocations` we check and confirm that all *53* entries are in the database:

```js

var thisQuery = "SELECT * FROM aalocations"


client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});
```

Console output:

```js
 Result {
  command: 'SELECT',
  rowCount: 53,
  oid: null,
  rows:
   [ { address: '252 W 46TH ST New York NY ',
       lat: 40.7593831,
       long: -73.9872329 },
     { address: '303 W 42ND ST New York NY ',
       lat: 40.7575385,
       long: -73.9901368 },
     { address: '303 W 42ND ST New York NY ',
       lat: 40.7575385,
       long: -73.9901368 },
     { address: '305 7TH AVE New York NY ',
       lat: 40.7467107,
       long: -73.9935208 },
...
...
...

```




## Final thoughts

I need to come up with a data model that will allow me to capture all of the remaining data fields in the website while also recognising each meeting as unique - not just the location. 