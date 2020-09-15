### Weekly Assignment 02 | Documentation | September 10th 2020

# Instructions
We will continue to work with the files you collected in Weekly Assignment 1. For this week, you will work with only one of the files; it will be determined by the last number of your New School ID. The last number of your ID corresponds with the AA Manhattan “zone” you are assigned. For example, if your ID is “N01234567”, work with the Zone 7 file. If it is “N09876543”, work with the Zone 3 file. If the last number of your New School ID ends with a “0”, work with the Zone 10 file. (At the bottom of this markdown file, there’s an image showing the map of the zones in Manhattan.)
1. Using Node.js, read the assigned AA text file that you wrote for last week’s assignment. Store the contents of the file in a variable.

2. Ask yourself, “why are we reading this from a saved text file instead of making another http request?”

3. Study the HTML structure of this file and began to think about how you might parse it to extract the relevant data for each meeting. Using this knowledge about its structure, write a program in Node.js that will write a new text file that contains the street address for *every* row in the table of meetings in your assigned AA file. Make a decision about the  [data types and data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)  you want to use to store this data in a file, knowing that you’ll be working with this data again later.

4. Update your GitHub repository with the relevant file(s); this should include a .js file(s) with your code and a .txt or other format file(s) with the addresses, plus a md file with your documentation. In Canvas, submit the URL of the specific location of this work within your data-structures GitHub repository. *Note: this should be in a directory that contains only your work for this week.*

## Starter code
```javascript

// npm install cheerio

var fs = require(‘fs’);
var cheerio = require(‘cheerio’);

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
var content = fs.readFileSync(‘data/thesis.txt’);

// load `content` into a cheerio object
var $ = cheerio.load(content);

// print (to the console) names of thesis students
$(‘h3’).each(function(I, elem) {
    console.log($(elem).text());
});

// write the project titles to a text file
var thesisTitles = ‘’; // this variable will hold the lines of text

$(‘.project .title’).each(function(I, elem) {
    thesisTitles += ($(elem).text()).trim() + ‘\n’;
});

fs.writeFileSync(‘data/thesisTitles.txt’, thesisTitles);

```

# Documentation
#### Initial recon of the file

Since my New School ID is *manzs324*, I picked the `m04.txt` file.

I scan the file for it’s contents and keep the live page ([New York Intergroup : Meeting List](http://parsons.nyc/aa/m04.html))  also opened by the side to see if I can point out the tags which contain the relevant information. As I want the meeting’s street addresses, I start noticing that they are stored in a table cell on the left side of the page - the tags `<td>` contain almost all the relevant text.

However, it is a bit complicated: there are many multiple meetings happening at a single street address (albeit on different dates or timings). So it becomes relevant to consider what we define as /one meeting/. I decide to treat each event happening at a street address as a discrete meeting so one street address /can/ occur many times in our output.

#### Setup folders and relevant packages

I copied the `m04.txt` file to the `data` folder in this week’s folder in the repo and installed the NPM package `cheerio` which should allow be to parse the DOM data in the text file.

We are reading the the contents from a saved file instead getting it from the live website. A great advantage in doing so is that we have a stable version of the file that we want to work with. It will not change and our code will remain replicable on that particular version of the file.

#### Access the data file with `cheerio`

I loaded the packages first and then read the file (via a `filename` variable) into a variable, `content`.  Then, using the `$` variable, attached the file to the `cheerio.load ()` function.

```javascript
//npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

let filename = 'data/m04'
var content = fs.readFileSync(filename + '.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

```

This allows us to now traverse through the file’s DOM using cheerio’s selectors.

#### Choosing a data structure for the street addresses - Part I
The instructions asked us to consider the data structure we will use to extract the street addresses into. I pick an array because I imagined that we will push each address parsed from the file into a collection (or rather an array) of street addresses.  Therefore, I created an `address` array:
```javascript
var address = [];

```



#### Traversing to the street addresses 

I had already noticed that we need to get to the street addresses using the `<td>` tags but I soon realised that it was going to be a problem as there were multiple `<td>` tags in the file! This meant that I needed to select the specific `<td>` which contained the street addresses.

Conventionally, classes and ID attributes are used to label specific HTML tags. Unfortunately, in this case, no such convention was followed. However, I did notice that the relevant `<td>` tag was styled in-line in the HTML file differently from the other `<td>` tags. So I needed to select tag using its style attribute as a guide.

I looked into the `cheerio` documents and found that the `.attr()` method allow us to match specific attribute values - in our case, `style = 'border-bottom:1px solid #e3e3e3; width:260px’` .

Therefore, this section of the code starts to take shape as such, where we use cheerio to select the `<td>` tag, then only consider the tag which has the exact style attribute we need and finally for each element in the tag, it runs the code within its scope:

```javascript
$('td').each(function(I, elem) {
    if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {

			console.log($(elem).html())

}

```

I logged the selected elements to the console and use cheerio’s `.html()` parser and it displays the following:

```html
//excerpt

                        <h4 style="margin:0;padding:0;">Blessed Sacrament (Rectory)</h4><br>
                                            <b>WOMEN&apos;S TELL IT LIKE IT IS - Women&apos;s Tell It Like It Is</b><br>
                                                152 West 71st Street, 
                                                <br>Between Broadway and Columbus Avenues) NY 10023
                                                <br>
                                                <br>
                        
                        <div class="detailsBox"> 
                                Women&apos;s Meeting 
                        </div>
                         
                                                <span style="color:darkblue; font-size:10pt;">
                        <img src="../images/wheelchair.jpg" alt="Wheelchair Access" width="20" vspace="5" hspace="10" align="absmiddle">Wheelchair access
                        </span>  
```                 

We successfully got the relevant content from the correct tag but are also capturing excess data (with quite a lot of special characters like `\n` and `\t`. 

I looked into the cheerio documents if it gives a more atomic selector so I can drill down further to only the street address text. The latter is not contained in any surrounding tag (or attribute, class, ID…). However, before I could find such a selector, I noticed that the there is a tag which could potentially act as a delimiter: `<br>`. 

I decided to use the `split()` function to return the text content into an array separated at the point where the `<br>` text occurs:

```javascript
$('td').each(function(I, elem) {
    if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {

			console.log($(elem).html().split('<br>'))

}

```


This returns the following array: 

```javascript

[ '\n                    \t<h4 style="margin:0;padding:0;">Mount Sinai - Roosevelt Hospital</h4>',
  '\n\t\t\t\t  \t    <b>WEST 58th STREET STEP - West 58th Street Step</b>',
  '\n\t\t\t\t\t\t1000 Tenth Avenue, 8th Fl, Room #8G-49, \n\t\t\t\t\t\t',
  '(Betw 58th &amp; 59th Streets) NY 10019\n\t\t\t\t\t\t',
  '\n\t\t\t\t\t\t',
  '\n                         \n\t\t\t\t\t\t<span style="color:darkblue; font-size:10pt;">\n                        <img src="../images/wheelchair.jpg" alt="Wheelchair Access" width="20" vspace="5" hspace="10" align="absmiddle">Wheelchair access\n                        </span>\n\t\t\t  \t\t\t\n\t\t\t\t\t\t\n                    ' ]

```

As we can see, the street addresses are in the third element  `[2]` of the array. However, the needless special characters are still present and almost every address has the accompanying special instruction (‘Downstairs, 3rd Floor, blue door…’)  attached the the street address. We will need to remove both from each address.

#### Matching street addresses using regular expressions

First, I decide to use the `trim()` method to remove the preceding and trailing special characters from the string and then I push the address into the array I created earlier.

```javascript
$('td').each(function(I, elem) {
    if ($(elem).attr('style') === 'border-bottom:1px solid #e3e3e3; width:260px') {

        address.push($(elem).html().split('<br>')[2].trim().match(/^\d{1,5}.+?(?=,|-)/gm))

}




```

Next I use the `match()` method to extract the all the variations of the addresses which were possible in the file. So it should match new string beginning with a number (for the streets and avenues) and capture everything up until just before the first comma. Hence, capturing only the street addresses and nothing more.

It worked an I ended up with an array of addresses. However, I saw that there were many repeating values in the array.

```javascript

[ [ '252 West 46th Street' ],
  [ '303 West 42nd Street' ],
  [ '303 West 42nd Street' ],
  [ '305 7th Avenue' ],
  [ '1 West 53rd Street' ],
  [ '303 West 42nd Street' ],
  [ '133 West 46th Street' ],
  [ '441 West 26th Street' ],
  [ '446 West 33rd Street' ],
  [ '252 West 46th Street' ],
  [ '252 West 46th Street' ],
  [ '252 West 46th Street' ],
  [ '339 West 47th Street' ],
  [ '303 West 42nd St Rm 306' ],
...
...
...
...

```

This is was because of the issue we uncovered in our initial recon of the file.  Since multiple meetings are attached to a street address, we need another element to be able to discern each individual meeting.

This meant we needed to reconsider the data structure for the storing the content.


####  Choosing a data structure for the street addresses - Part II 

Since realising our new needs, I decided to use the object data structure. Objects can contain multiple types of data structures within them.
Therefore, an object with both, the street addresses and the meeting names could represent the data better:

``` javascript

var aa = {
    zone: 'Zone 4',
    meetings: []
};

```

I created an object `aa` with two elements inside it: 1) the zone and 2) an array which will store all the meeting data that we have.

I alter our parsing code as such: 

```javascript

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

console.log(aa.meetings);

```

I pushed the street addresses into the `meeting` array as another array called the `street address` and created two new variables to hold 1) the an ‘ID’ of the meeting as `meeting_number`  and 2) the name of the meeting as `meeting_name`.

I used `.match()` again to get the meeting names from the `<br>`-delimited array (they were the second `[1]` element). 

This give us the result as:

```javascript

[ { meeting_number: 1,
    street_address: [ '252 West 46th Street' ],
    meeting_name: '4 THE GRACE ' },
  { meeting_number: 2,
    street_address: [ '303 West 42nd Street' ],
    meeting_name: '42nd AT 9:00pm ' },
  { meeting_number: 3,
    street_address: [ '303 West 42nd Street' ],
    meeting_name: 'A NEW FREEDOM ' },
  { meeting_number: 4,
    street_address: [ '305 7th Avenue' ],
    meeting_name: 'ABINGDON SQUARE IN CHELSEA ' },
  { meeting_number: 5,
    street_address: [ '1 West 53rd Street' ],
    meeting_name: 'ADVENTURES IN SOBRIETY ' },
  { meeting_number: 6,
    street_address: [ '303 West 42nd Street' ],
    meeting_name: 'ALANON HOUSE   (AA Meetings Only) ' },
  { meeting_number: 7,
    street_address: [ '133 West 46th Street' ],
    meeting_name: 'AMAZING GRACE ' },
  { meeting_number: 8,
    street_address: [ '441 West 26th Street' ],
    meeting_name: 'ANNEX                               (:I) ' },
  { meeting_number: 9,
    street_address: [ '446 West 33rd Street' ],
    meeting_name: 'ANNEX    (:II) ' },
  { meeting_number: 10,
    street_address: [ '252 West 46th Street' ],
    meeting_name: 'ARTISTS IN RECOVERY ' },
  { meeting_number: 11,
    street_address: [ '252 West 46th Street' ],
    meeting_name: 'BEGINNERS ' },
  { meeting_number: 12,
    street_address: [ '252 West 46th Street' ],
    meeting_name: 'BEGINNERS ' },
  { meeting_number: 13,
    street_address: [ '339 West 47th Street' ],
    meeting_name: 'BETWEEN SHOWS ' },
  { meeting_number: 14,
    street_address: [ '303 West 42nd St Rm 306' ],
    meeting_name: 'BLUEPRINT FOR LIVING ' },
  { meeting_number: 15,
    street_address: [ '139 West 31st Street' ],
    meeting_name: 'BOOKSHOP AT NOON ' },
  { meeting_number: 16,
    street_address: [ '422 West 57th Street' ],
    meeting_name: 'CLEAN AND DRY ' },
  { meeting_number: 17,
    street_address: [ '211 West 30th Street' ],
    meeting_name: 'COMMUTERS SPECIAL ' },
  { meeting_number: 18,
    street_address: [ '252 West 46th Street' ],
    meeting_name: 'D.I.V.A.  (Divinely Inspired Vivacious Alcoholics) ' },
  { meeting_number: 19,
    street_address: [ '1 West 53rd Street' ],
    meeting_name: 'FIFTH AVENUE STEP ' },
  { meeting_number: 20,
    street_address: [ '422 West 57th Street' ],
    meeting_name: 'FIRESIDE  (:I)  WEEKDAY MEETINGS ONLY ' },
...
...
...
...
 { meeting_number: 52,
    street_address: [ '423 West 46th Street' ],
    meeting_name: 'YOUNG IN 164 ' },
  { meeting_number: 53,
    street_address: [ '252 West 46th Street' ],
    meeting_name: 'YOUNG PEOPLE&apos;S MEETING ' } ]

```

Each meeting (as we defined it) can now be tracked in the data with an ID, its name, and the corresponding street address.


#### Save the street addresses into an external file

Satisfied with the result, I write the file into a text file in the `data` folder.

```javascript

fs.writeFileSync(filename + '_aa' + '.txt', aa);
```

When I open the file, it only shows this:

```
[object Object]
```


Searching through the documentation, I read that objects cannot be outputted into a file like other data structures and I need to convert the object into a JSON object which can be processed by the `fs.writeFileSync()` function.

I make the required changes with the `JSON.stringify()` function:
```javascript

fs.writeFileSync(filename + '_JSON' + '.txt', JSON.stringify(aa));
```

This gives me the resulting string stored in the `data` folder: 

```json

{"zone":"Zone 4","meetings":[{"meeting_number":1,"street_address":["252 West 46th Street"],"meeting_name":"4 THE GRACE "},{"meeting_number":2,"street_address":["303 West 42nd Street"],"meeting_name":"42nd AT 9:00pm "},{"meeting_number":3,"street_address":["303 West 42nd Street"],"meeting_name":"A NEW FREEDOM "},{"meeting_number":4,"street_address":["305 7th Avenue"],"meeting_name":"ABINGDON SQUARE IN CHELSEA "},{"meeting_number":5,"street_address":["1 West 53rd Street"],"meeting_name":"ADVENTURES IN SOBRIETY "},{"meeting_number":6,"street_address":["303 West 42nd Street"],"meeting_name":"ALANON HOUSE   (AA Meetings Only) "},{"meeting_number":7,"street_address":["133 West 46th Street"],"meeting_name":"AMAZING GRACE "},{"meeting_number":8,"street_address":["441 West 26th Street"],"meeting_name":"ANNEX                               (:I) "},{"meeting_number":9,"street_address":["446 West 33rd Street"],"meeting_name":"ANNEX    (:II) "},{"meeting_number":10,"street_address":["252 West 46th Street"],"meeting_name":"ARTISTS IN RECOVERY "},{"meeting_number":11,"street_address":["252 West 46th Street"],"meeting_name":"BEGINNERS "},{"meeting_number":12,"street_address":["252 West 46th Street"],"meeting_name":"BEGINNERS "},{"meeting_number":13,"street_address":["339 West 47th Street"],"meeting_name":"BETWEEN SHOWS "},{"meeting_number":14,"street_address":["303 West 42nd St Rm 306"],"meeting_name":"BLUEPRINT FOR LIVING "},{"meeting_number":15,"street_address":["139 West 31st Street"],"meeting_name":"BOOKSHOP AT NOON "},{"meeting_number":16,"street_address":["422 West 57th Street"],"meeting_name":"CLEAN AND DRY "},{"meeting_number":17,"street_address":["211 West 30th Street"],"meeting_name":"COMMUTERS SPECIAL "},{"meeting_number":18,"street_address":["252 West 46th Street"],"meeting_name":"D.I.V.A.  (Divinely Inspired Vivacious Alcoholics) "},{"meeting_number":19,"street_address":["1 West 53rd Street"],"meeting_name":"FIFTH AVENUE STEP "},{"meeting_number":20,"street_address":["422 West 57th Street"],"meeting_name":"FIRESIDE  (:I)  WEEKDAY MEETINGS ONLY "},{"meeting_number":21,"street_address":["7 West 55th Street"],"meeting_name":"FOGLIFTERS-FIFTH AVENUE "},{"meeting_number":22,"street_address":["252 West 46th Street"],"meeting_name":"FORTY-FIVE SOLUTIONS "},{"meeting_number":23,"street_address":["729 7th Avenue"],"meeting_name":"GREEN ROOM "},{"meeting_number":24,"street_address":["538 West 47th Street"],"meeting_name":"GRUPO BUENA VOLUNTAD "},{"meeting_number":25,"street_address":["1000 Tenth Avenue"],"meeting_name":"HELL&apos;S KITCHEN "},{"meeting_number":26,"street_address":["303 West 42nd Street"],"meeting_name":"HENRY HUDSON "},{"meeting_number":27,"street_address":["252 West 46th Street"],"meeting_name":"JOE AND CHARLIE CD MEETING "},{"meeting_number":28,"street_address":["307 West 26th Street"],"meeting_name":"LEARNING TO LIVE (:I) "},{"meeting_number":29,"street_address":["405 West 59th Street"],"meeting_name":"LUCKY ONES "},{"meeting_number":30,"street_address":["303 West 42nd Street"],"meeting_name":"MIDNIGHT IN MIDTOWN "},{"meeting_number":31,"street_address":["422 W. 57th St."],"meeting_name":"MIRACLE "},{"meeting_number":32,"street_address":["133 West 46th Street"],"meeting_name":"MORNING CALL "},{"meeting_number":33,"street_address":["133 West 46th Street"],"meeting_name":"NEW BUT WEST "},{"meeting_number":34,"street_address":["303 West 42nd Street"],"meeting_name":"NEW PHOENIX "},{"meeting_number":35,"street_address":["296 9th Avenue"],"meeting_name":"NINTH AVENUE           (:I) "},{"meeting_number":36,"street_address":["139 West 31st Street"],"meeting_name":"NU GARDEN "},{"meeting_number":37,"street_address":["1 West 53rd Street"],"meeting_name":"PARK BENCH   (:I) "},{"meeting_number":38,"street_address":["484 West 43rd Street"],"meeting_name":"POWERLESS "},{"meeting_number":39,"street_address":["7 West 55th Street"],"meeting_name":"PROMISES "},{"meeting_number":40,"street_address":["252 West 46th Street"],"meeting_name":"PROMISES "},{"meeting_number":41,"street_address":["252 West 46th Street"],"meeting_name":"RAINBOW ROOM "},{"meeting_number":42,"street_address":["4 West 43rd Street"],"meeting_name":"RENAISSANCE "},{"meeting_number":43,"street_address":["252 West 46th Street"],"meeting_name":"SATURDAY ROTATING 12 STEP "},{"meeting_number":44,"street_address":["296 Ninth Avenue"],"meeting_name":"SPIRITUAL FRIDAYS "},{"meeting_number":45,"street_address":["1 West 53rd Street"],"meeting_name":"ST. THOMAS A.M. "},{"meeting_number":46,"street_address":["210 West 31st Street"],"meeting_name":"STATLER AT NOON "},{"meeting_number":47,"street_address":["422 West 57th Street"],"meeting_name":"STEPS AND TRADITIONS ON WEDNESDAY "},{"meeting_number":48,"street_address":["252 West 46th Street"],"meeting_name":"SUNDAY NIGHT BEGINNERS "},{"meeting_number":49,"street_address":["134 West 29th Street "],"meeting_name":"TUESDAY SOBER AGNOSTICS "},{"meeting_number":50,"street_address":["1000 Tenth Avenue"],"meeting_name":"WEST 58th STREET STEP "},{"meeting_number":51,"street_address":["446 West 33rd Street"],"meeting_name":"WOMEN OVER FORTY "},{"meeting_number":52,"street_address":["423 West 46th Street"],"meeting_name":"YOUNG IN 164 "},{"meeting_number":53,"street_address":["252 West 46th Street"],"meeting_name":"YOUNG PEOPLE&apos;S MEETING "}]}
```


#### Note:

I ran the code again with other files from the first assignment; to see how general this code was and the regular expressions were able to parse everything correctly on almost two-thirds of the files. This shows that perhaps regular expressions are not the best approach here if we want to be able to parse more universally.