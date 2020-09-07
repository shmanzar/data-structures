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
I noticed that the given URLs share a pattern - they are similar except incrementally changing the digit just before `.txt` extension. Therefore, it would make sense to iteratively generate URLs as strings and store them in an array.

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


#### Request all 10 pages and store their content in text files

First, I wanted to solve this problem for at least one page so that later I can simply apply the solution to all ten pages.





