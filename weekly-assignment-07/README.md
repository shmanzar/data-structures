# Weekly Assignment 7
#school/fall20/ds



### Weekly Assignment 07 | Documentation | October 15th 2020

# Instructions
Instructions for this assignment can be found on the course [repo](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_07.md).

# Documentation
## Setup folders and relevant packages
We created a `data` folder to hold all the data files previously downloaded in [Assignment 1](https://github.com/shmanzar/data-structures/tree/master/weekly-assignment-01).  We also created subfolders, `parsed_data` and `geocode_data` to hold our cleaned outputs.

We divided the entire workflow into five separate scripts, each performing one discrete task.



## Parsing and cleaning [01_clean_parse.js]
We used the `.each` function to iterate over a page and get its relevant table content text. The we used to cleaning blocks to extract and clean the address data and meetings data. We created two Objects, `Address`, and `Meeting_Instance` to store all the cleaned content:


```js
   let counter = 1;
    $('tr tr tr').each(function(i, outer_elem) {
        if (i > 0) {

            var Address = new Object()
            Address.meetings_list = new Array

            $(outer_elem).find('td').eq(0).each(function(i, elem) {

                if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {

                    Address.location_number = counter
                    Address.building_name = $(elem).html().split('</h4>')[0].trim().split("<h4 style=\"margin:0;padding:0;\">")[1]
                    Address.street_address = $(elem).html().split('<br>')[2].trim().split(",")[0]
                    Address.secondary_address = $(elem).html().split('<br>')[2].trim().split(',').splice(1, 2)[0].trim()
                    Address.meeting_name = $(elem).html().split('<br>')[1].trim().match(/\b(\d{1,3}\s|\d{1,3}nd\s|\d{1,3}rd\s|\d{1,3}st\s|\d{1,3}st\s|[A-Z\s])+\b.+?(?=-)/gm)[0]
                    Address.details = $(elem).find('div').text().trim()
                    Address.wheelchair = $(elem).text().trim().match(/(Wheelchair access)/gm)

                }

                counter++;

 })
            aa.table.push(Address)


            $(outer_elem).find('td').eq(1).each(function(i, elem) {

                // clean everything in this column:
                var meetingDump = $(elem).text().trim();


                meetingDump = meetingDump.replace(/[" "\t]+/g, " ");
                meetingDump = meetingDump.replace(/[\n|\r\n]/g, " ");
                meetingDump = meetingDump.split(/\s{11}/g);

                var meetingDumpTD = meetingDump[0].split(/\s{8}/g).map(function(e) {
                    return e.trim();
                });

                var mdSpecialInterest;
                for (var i = 0; i < meetingDumpTD.length; i++) {
                    var interest = meetingDumpTD[i].split('Special Interest')[1];

                    if (interest) {
                        mdSpecialInterest = interest.trim();
                    }
                    else {
                        mdSpecialInterest = '';
                    }
                    var meetType = meetingDumpTD[i].split('Type ')[1]

                    var meetTypeCode, meetTypeCodeName;


                    if (meetType) {
                        meetTypeCode = meetType.split(' ')[0];
                        if (meetType.match('Special')) {
                            meetTypeCodeName = meetType.split('= ')[1].split(' Special')[0];
                        }
                        else {
                            meetTypeCodeName = meetType.split('= ')[1];
                        }
                    }
                    else {
                        meetTypeCodeName = '';
                    }
                    var meetsplit = meetingDumpTD[i].split(' ');

                    var time_start = meetsplit[2];
                    var time_end = meetsplit[5]
                    var e_a_p = meetsplit[6];
                    var s_a_p = meetsplit[3];


                    // push into Meeting_Instance object
                    var Meeting_Instance = new Object();
                    Meeting_Instance.meeting_id = i + 1;
                    Meeting_Instance.typeCode = meetTypeCode;
                    Meeting_Instance.typeName = meetTypeCodeName;
                    Meeting_Instance.weekDay = meetsplit[0];
                    Meeting_Instance.startTime = time_start;
                    Meeting_Instance.startTime_amPm = s_a_p;
                    Meeting_Instance.endTime = time_end;
                    Meeting_Instance.endTime_amPm = e_a_p;
                    Meeting_Instance.interest = mdSpecialInterest;

                    Address.meetings_list.push(Meeting_Instance)

                } // for loop end

            }) //2nd find 

        }
    }) //overall find (tr)

```

The address and meeting cleaning blocks used a range of `split()`, `replace()` , and regular expressions to extract everything from the street addresses and building names to the starting and ending times of an individual meeting session.

Once the two block clean and parse the data within the `.each` loops, we pushed both the `Meeting_Instance` (first into an array called `meeting_list`) and `Address`  data into an Object `aa`’ array called `table`.

```js
    var aa = new Object()
    aa.table = []
...
...
...
```



## Retrieving data from all zones  [01_clean_parse.js]
We had been successful in constructing a cleaning and parsing code for a single file in the data, and now needed to loop on the remaining dataset and execute the same cleaning and parsing routine: 

```js
for (let i = 1; i < 11; i++) {

    let filename = 'data/m' + i
    var content = fs.readFileSync(filename + '.txt');

...
...
...
}

```

We encapsulated the entire `.each()` loops inside the above `for` loop and traversed the entire dataset while outputting each cleaned file in the following code: 

```js
console.log(aa.table)
    fs.writeFileSync("data/parsed_data/parse_m" + i + ".json", JSON.stringify(aa.table));
```


## Geocoding all locations [02_geocode.js]
We configured our `.env` file to manage our credentials and read a cleaned file from the last section.


 We then used the following code to query the TAMU API for geocoding the street addresses contained in each file and storing them in another JSON file:


```js
    async.eachSeries(addresses, function(value, callback) {
            let query = {
                streetAddress: value.street_address,
                city: "New York",
                state: "NY",
                apikey: API_KEY,
                format: "json",
                version: "4.01"
            };

            let apiRequest = API_URL + '?' + querystring.stringify(query);

            request(apiRequest, function(err, resp, body) {
                if (err) { throw err; }

                let tamuGeo = JSON.parse(body);


                let latlong = [];


                latlong.push(tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude']);
                latlong.push(tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude']);
                let tamuGeoFinal = new Object();
                tamuGeoFinal.StreetAddress = tamuGeo['InputAddress'];

                tamuGeoFinal.LatLong = latlong;
                value.GeoCoord = latlong;

                meetingsData.push(value);
            });

            // sleep for a couple seconds before making the next request
            setTimeout(callback, 2000);
        },


```

This code block is then encapsulated inside another `for` loop to run it over all of the parsed files of the previous section.

## Inserting into an SQL database

### Creating a new table in the database [03_create_table.js]

Before we could can export all our new data into the PostgresSQL database, we need to create a new table capable of holding the expanded dataset:

```js
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
var thisQuery = "CREATE TABLE aalocations (ID serial primary key, Address varchar(1000), GeoCoord varchar(1000), Building_name varchar(1000), Secondary_address varchar(1000), Meeting_name varchar(1000), Details varchar(1000), Wheelchair varchar(1500), Meeting_code varchar(1000), Meeting_typeName varchar(1000), WeekDay varchar(1000), StartTime varchar(1000), EndTime varchar(1000), Special_interest varchar(1000))"
// Sample SQL statement to delete a table: 
// var thisQuery = "DROP TABLE aalocations;";

client.query(thisQuery, (err, res) => {
    console.log(err, res);
    client.end();
});


```

This new table `aalocations` uses a newly created `ID`  as primary key (which counts each meeting instance being stored in the database, and creates columns suitable to hold all the newly parsed data from the last section.


### Inserting data into the new table [04_insert_sql.js]

Since we were facing issues while inserting all the data into the database because of *escape characters*, we used `pg-escape` `npm` package to handle the escape characters while we are doing the inserts.

We used a for loop again to loop through the entire dataset of files holding the geocode json data. Furthermore, we used two sets of `async.eachSeries` functions to first, insert the meeting’s location data (`meeting`) and then subsequently, to insert the each sessions data (`slot`)

```js

for (let i = 1; i <= 10; i++) { // loop through files with multiple meetings

    let addressesForDb = JSON.parse(fs.readFileSync(`data/geocode_data/map${i}geo.json`));

    async.eachSeries(addressesForDb, function(meeting, callback) { // loop through meetings 


        let meeting_list = meeting.meetings_list;

        async.eachSeries(meeting_list, function(slot, callback) { //loop through each time slot for each meeting
            const client = new Client(db_credentials);
            client.connect();
            // var thisQuery = "INSERT INTO aalocations VALUES (E'" + meeting.street_address + "', '"+meeting.GeoCoord+ "', '" + meeting.building_name+ "', '" + meeting.secondary_address + "', '" + 
            //     meeting.meeting_name+ "', '" + meeting.details + "', '" + meeting.wheelchair+ "', '" +slot.typeCode+ "', '" + slot.weekDay+ "', '" +slot.startTime+slot.startTime_amPm+ "', '" +slot.endTime+slot.endTime_amPm+ "', '" +
            //     slot.interest+"');"; 

            var thisQuery = escape("INSERT INTO aalocations VALUES (DEFAULT, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L )",
                meeting.street_address,
                meeting.GeoCoord,
                meeting.building_name,
                meeting.secondary_address,
                meeting.meeting_name,
                meeting.details,
                meeting.wheelchair,
                slot.typeCode,
                slot.typeName, //Meeting_Instance.typeName = meetTypeCodeName;
                slot.weekDay,
                slot.startTime + slot.startTime_amPm,
                slot.endTime + slot.endTime_amPm,
                slot.interest);


            console.log(thisQuery);
            client.query(thisQuery, (err, res) => {
                console.log(err, res);
                client.end();
            });
            setTimeout(callback, 1000);
        });
        setTimeout(callback, 1000);
    })
}
```

## Accessing data [05_select_sql.js]

Finally,  we check whether all the cleaned, parsed, geocoded and combined data is in the SQL database by querying it back using `SELECT`:

```js
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query the entire contents of a table: 
var thisQuery = "SELECT * FROM aalocations;";

client.query(thisQuery, (err, res) => {
    console.log(err, res.rows);
    client.end();
});

```


## Final thoughts
This was an extensive cleaning exercise utilising many hours worth of effort from all of us (Dallas, Morgane, and myself) over two weeks. If this week’s assignment does indeed end being the lengthiest one then that’s another evidence to data cleaning being a substantial part of a project’s timeline. 

 
