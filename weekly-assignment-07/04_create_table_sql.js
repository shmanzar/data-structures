const { Client } = require('pg');
var async = require('async');
const dotenv = require('dotenv');
const fs = require('fs');
var escape = require('pg-escape');


dotenv.config();

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_UN;
db_credentials.host = process.env.AWSRDS_HOST;
db_credentials.database = process.env.AWSRDS_DB;
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = process.env.AWSRDS_PORT;


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
