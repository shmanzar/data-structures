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
    meetings: []
};

let counter = 1;
$('td').each(function(I, elem) {
    if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {
        $(elem).html().split('<br>')
        aa.meetings.push({
            meeting_number: counter,
            street_address: $(elem).html().split('<br>')[2].trim().match(/^\d{1,5}.+?(?=,|-)/gm),
            meeting_name: $(elem).html().split('<br>')[1].trim().match(/\b(\d{1,3}\s|\d{1,3}nd\s|\d{1,3}rd\s|\d{1,3}st\s|\d{1,3}st\s|[A-Z\s])+\b.+?(?=-)/gm)[0]
        })
        counter++;
    }
});

console.log(aa.meetings)


fs.writeFileSync(filename + '_JSON' + '.txt', JSON.stringify(aa));
