// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
var content = fs.readFileSync('data/m04.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

// print (to the console) names of thesis students
$('h4').each(function(I, elem) {
    console.log($(elem).text());
});

// write the project titles to a text file
// var thesisTitles = ''; // this variable will hold the lines of text

// $('.project.title').each(function(I, elem) {
//     thesisTitles += ($(elem).text()).trim() + '\n';

// });

// fs.writeFileSync('data/thesisTitles.txt', thesisTitles);
