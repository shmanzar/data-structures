### Weekly Assignment 01 | Documentation | September 4th 2020

## Instructions


1. Using Node.js (in Cloud 9), make a request for each of the ten "Meeting List Agenda" pages for Manhattan. **Important: show the code for all ten requests.**    
```
https://parsons.nyc/aa/m01.html  
https://parsons.nyc/aa/m02.html  
https://parsons.nyc/aa/m03.html  
https://parsons.nyc/aa/m04.html  
https://parsons.nyc/aa/m05.html  
https://parsons.nyc/aa/m06.html  
https://parsons.nyc/aa/m07.html  
https://parsons.nyc/aa/m08.html  
https://parsons.nyc/aa/m09.html  
https://parsons.nyc/aa/m10.html   
```

2. Using Node.js: For each of the ten files you requested, save the body as a **text file** to your "local" environment (in AWS Cloud9).

3. Study the HTML structure and tags and begin to think about how you might parse these files to extract relevant data for these AA meetings.

4. Update your GitHub repository with the relevant files: your `js` file and ten `txt` files, plus a `md` file with your documentation. In Canvas, submit the URL of the specific location of this work within your `data-structures` GitHub repository. 

## Starter code

```javascript
// npm install request
// mkdir data

var request = require('request');
var fs = require('fs');

request('https://parsons.nyc/thesis-2020/', function(error, response, body){
    if (!error && response.statusCode == 200) {
        fs.writeFileSync('/home/ec2-user/environment/data/thesis.txt', body);
    }
    else {console.log("Request failed!")}
});
```



# Documentation

We need to query 10 files from a server and then store their content (HTML) in separate text files in a `data` folder.

First, I ran the starter code and observed that the result was a text file with the URL’s content inside it. So I needed to run that code block iteratively over the given URL list.

#### Generate list of URLs in an array
I noticed that the given URLs share a pattern - they are similar except incrementally changing the digit just before `.html` extension. Therefore, it would make sense to iteratively generate URLs as strings and store them in an array.

```javascript

var link_array = [];

for (let i = 0; i <= 10; i++) {
    link_array.push('https://parsons.nyc/aa/m0' + i + '.html');
    if (link_array[i] === 'https://parsons.nyc/aa/m010.html') {
        link_array[i] = 'https://parsons.nyc/aa/m10.html';

    }
}


```
 
The array `link_array` is populated by the for-loop. However, it adds two elements in the array which are invalid: 

```javascript
'https://parsons.nyc/aa/m010.html'
'https://parsons.nyc/aa/m00.html'

```

So I remove the first value from the array by replacing it with the correct value within the loop. The second value is removed by the filter method on the array and that results in a new array called `filtered_array`. The new array has all the values except the one matching the invalid entry created by the loop. 

```javascript

var filtered_array = link_array.filter(function(value) { return value != 'https://parsons.nyc/aa/m00.html' });

```


#### Request one page and store it's contents

First, I wanted to solve this problem for at least one page so that later I can simply apply the solution to all ten pages. I made a `data` folder so that I can store the downloaded file. I installed the `npm` module `request`

I decided to run the code with the input URL change to one from the array. I added a `console.log()`  marking a successful download:

```javascript 

    request('https://parsons.nyc/aa/m01.html', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFileSync('data/test.txt', body);
            console.log("File downloaded!");
        }
        else { console.log("Request failed!") }
    });

```


This worked as expected and downloaded a single file called `test.txt` in the `data` folder.

Next, I wanted to run this code ten times on each item in the `filtered_array`. So I decided to convert the download code into a function called `getData()` which takes in a string signifying a URL link and then downloads them.

```javascript
function getData(link) {
    request(link, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFileSync('data/test.txt', body);
            console.log("File downloaded!");
        }
        else { console.log("Request failed!") }
    });
}
```

I tested the function with `getData('https://parsons.nyc/aa/m01.html')` and it worked.

#### Store each URL content in a separate appropriately named file

I realised I needed to alter the `writeFileSync` function such that for each link in `filtered_array` , it saves each downloaded file separately in `data`. 
I also wanted to have sensible naming convention for the downloaded files; something which matches the URLs. So I decided that each downloaded file should be named after the respective HTML page it was extracted from. For example:

`'https://parsons.nyc/aa/m01.html'` should result in a text file called `m01.txt` in the `data` folder.
I thought this was good use case for regular expressions which I had previously used in other languages. So after looking in the documentation, I saw that the `match()` function fulfilled this requirement. 

`match()` is a method which can applied to strings - it takes in a regular expression and results in the matching values for the string.  Since I needed only to match the name of the HTML file in the URL and they all followed a patter where the name started with a `m` and was followed by two digits, I used the regular expression `m\d{2}`  and stored the resulting value into variable called `filename`.

```javascript

let filename = link.match(/m\d{2}/g);

```


Then in the writeFileSync function, I concatenated the matched `filename` to produce individual paths to text files in the `data` folder.

```javascript

fs.writeFileSync('data/' + filename + '.txt', body);

```

The `getData()` function finally looked like this:

```javascript
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

```


#### Request each page iteratively

I needed now to call this function on each of the ten URLs stored in the `filtered_array` .
I used the `forEach()` array method for and called it as an arrow function for the array.

```javascript
filtered_array.forEach(link => getData(link));

```

I get ten `File downloaded!` confirmations on the console and the data folder is populated with ten text files

```
m01.txt
m02.txt
…
…
…
…
m10.txt
```
 
Each text files contains the html content from the URLs. They are big files since they have the style data as part of the html file rather than being a separate CSS file. Right around in the middle of the file, is the HTML code with the meeting locations data. It looks like it has been stored in multiple tables.



