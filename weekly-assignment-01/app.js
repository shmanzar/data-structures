// npm install request
// mkdir data

var request = require('request');
var fs = require('fs');


var link_array = [];

for (let i = 0; i <= 10; i++) {
    link_array.push('https://parsons.nyc/aa/m0' + i + '.html');
    if (link_array[i] === 'https://parsons.nyc/aa/m010.html') {
        link_array[i] = 'https://parsons.nyc/aa/m10.html';

    }
}


var filtered_array = link_array.filter(function(value) { return value != 'https://parsons.nyc/aa/m00.html' });

function getData(link) {
    request(link, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            let filename = link.match(/m\d{2}/g);
            fs.writeFileSync('data/' + filename + '.txt', body);
            console.log("File downloaded!");
        }
        else { console.log("Request failed!") }
    });
}

filtered_array.forEach(link => getData(link));
