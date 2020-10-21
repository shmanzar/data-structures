// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
let filename = 'data/m04'
var content = fs.readFileSync(filename + '.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

var aa = {
    zone: 'Zone 4',
    address: [],
    meeting_data: []

};

let counter = 1;
$('td').each(function(I, elem) {
    // console.log($(elem))
    if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {

        // console.log($('div:nth-child(8)').html().trim())

        aa.address.push({
            meeting_number: counter,
            building_name: $(elem).html().split('</h4>')[0].trim().split("<h4 style=\"margin:0;padding:0;\">")[1],
            street_address: $(elem).html().split('<br>')[2].trim().match(/^\d{1,5}.+?(?=,|-)/gm)[0],
            secondary_address: $(elem).html().split('<br>')[2].trim().split(',').splice(1, 2),
            meeting_name: $(elem).html().split('<br>')[1].trim().match(/\b(\d{1,3}\s|\d{1,3}nd\s|\d{1,3}rd\s|\d{1,3}st\s|\d{1,3}st\s|[A-Z\s])+\b.+?(?=-)/gm)[0],
            details: $(elem).find('div').text().trim(),
            wheelchair: $(elem).text().trim().match(/(Wheelchair access)/gm),


        })
        counter++;
    }
    if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3;width:350px;') {
        console.log($(elem).html().trim().split('<br>'))
        aa.meeting_data.push({
            meeting_day: $(elem).html().trim().split('<br>')


        });

    }
    // console.log(aa.address)
    // console.log(aa.meeting_data)
})

// console.log(aa)


// fs.writeFileSync(filename + '_JSON' + '.txt', JSON.stringify(aa));
