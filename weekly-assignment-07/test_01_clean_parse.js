// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
let filename = 'data/m04'
var content = fs.readFileSync(filename + '.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);


var aa = new Object()
aa.table = []



let counter = 1;
$('tr tr tr').each(function(i, outer_elem) {
    var Address = new Object()
    Address.meetings_list = new Array

    $(outer_elem).find('td').eq(0).each(function(i, elem) {

        if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {

            Address.location_number = counter
            Address.building_name = $(elem).html().split('</h4>')[0].trim().split("<h4 style=\"margin:0;padding:0;\">")[1]
            Address.street_address = $(elem).html().split('<br>')[2].trim().match(/^\d{1,5}.+?(?=,|-)/gm)[0]
            Address.secondary_address = $(elem).html().split('<br>')[2].trim().split(',').splice(1, 2)[0].trim()
            Address.meeting_name = $(elem).html().split('<br>')[1].trim().match(/\b(\d{1,3}\s|\d{1,3}nd\s|\d{1,3}rd\s|\d{1,3}st\s|\d{1,3}st\s|[A-Z\s])+\b.+?(?=-)/gm)[0]
            Address.details = $(elem).find('div').text().trim()
            Address.wheelchair = $(elem).text().trim().match(/(Wheelchair access)/gm)

        }


        counter++;
        // aa.table.push(Address)
        // console.log(aa.table)


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

        // console.log(meetingDumpTD)
        var mdSpecialInterest;
        for (var i = 0; i < meetingDumpTD.length; i++) {
            var interest = meetingDumpTD[i].split('Special Interest')[1];

            if (interest) {
                mdSpecialInterest = interest.trim();
            }
            else {
                mdSpecialInterest = '';
            }
            // console.log(mdSpecialInterest)
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
            // console.log(meetType)
            var meetsplit = meetingDumpTD[i].split(' ');
            // console.log(meetsplit)

            //12 -> 24hrs

            var time_start = meetsplit[2];
            var time_end = meetsplit[5]
            var e_a_p = meetsplit[6];
            var s_a_p = meetsplit[3];
            // console.log(Date.parse(time_end))



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
            // console.log(Address.meetings)

            // meetings_list.push(Meeting_Instance)
            Address.meetings_list.push(Meeting_Instance)

        } // for loop end
        // console.log(Address.meetings_list)

    }) //2nd find 

    // aa.table.push(Address.meetings_list) // AH - works

}) //overall find (tr)

// aa.table.push(Address)



console.log(aa.table)
