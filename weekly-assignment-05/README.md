
### Weekly Assignment 04 | Documentation | October 3rd 2020

# Instructions
Instructions for this assignment can be found on the course [repo](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_05.md).

# Documentation
## Setup folders and relevant packages
I created an DynamoDB database on AWS and connected it to my Cloud9 environment by setting up the necessary credentials.  

I also installed the NPM package `aws-sdk` to interact with the DynamoDB database in node.

## Part One: Plan
My diary is going to record various recipes I am trying out from three different recipe books. I plan on using a denormalised data model based on the NoSQL structure. The *’table’* is called `recipeDiary` and the *primary key* is made up of the *partition key*, `recipeID` and the *sort key*, `datetime`. 

`recipeID` is a Number denoted by a 4-digit code that I have assigned each cookbook and the `datetime` is also Number specifying the date I went through the recipe.

The other parameters which can be stored in the database are `recipeTitle`, `book`, `author`, `cuisine`, `rating`, `servings`, `ingredientsList,` and`imageLink`
	
![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-05/w05_datamodel.jpeg)	
	

##  Part Two: Create some data for the table in your database


Using the above data model, I make a class `RecipeEntry` which can create objects to populate the array `recipeEntries`. The array can later be stored into a DynamoDB.

I convert the `recipeID` and `datetime` to Numbers in order to make them acceptable to the database specifications. 

I also make the following parameters:  `cuisine`, `rating`, `servings`, `ingredientsList,` and`imageLink` optional by allowing null values for it.


```js
var recipeEntries = [];

class RecipeEntry {
    constructor(recipeID, datetime, recipeTitle, author, book, cuisine, rating, servings, ingredientList, imageLink) {
        this.recipeID = {};
        this.recipeID.N = recipeID.toString();
        this.datetime = {};
        this.datetime.N = new Date(datetime).getTime().toString();
        this.month = {};
        this.month.N = new Date(datetime).getMonth().toString();
        this.recipeTitle = {};
        this.recipeTitle.S = recipeTitle;
        this.author = {};
        this.author.S = author;
        this.book = {};
        this.book.S = book;
        if (cuisine != null) {
            this.cuisine = {};
            this.cuisine.S = cuisine;
        }
        this.rating = {};
        this.rating.N = rating.toString();
        if (servings != null) {
            this.servings = {};
            this.servings.N = servings.toString();
        }
        if (ingredientList != null) {
            this.ingredientList = {};
            this.ingredientList.SS = ingredientList;
        }
        if (imageLink != null) {
            this.imageLink = {};
            this.imageLink.S = imageLink;
        }
    }
}
```


Then I push the first five entries into the array: 

```js
recipeEntries.push(new RecipeEntry(10001, 'September 28 2020', "Pork liver and leeks", 'Fergus Henderson', 'Nose to Tail', 'British', '9', '6', ['pork liver', 'leeks', 'butter', 'brandy', 'stock', 'paprikka']));

recipeEntries.push(new RecipeEntry(10001, 'September 30 2020', "Roast bone marrow and parsely salad", 'Fergus Henderson', 'Nose to Tail', 'British', '10', '2', ['veal marrowbones', 'parsely', 'shallots', 'capers', 'toast', 'olive oil', 'Maldon salt']));

recipeEntries.push(new RecipeEntry(10002, 'October 2  2020', "Lentils and scallion salad", 'Edna Lewis', 'Taste of Country Cooking', 'American', '9', '4', ['lentils', 'scallions', 'olive oil', 'mustard', 'ham', 'white wine vinegar']));

recipeEntries.push(new RecipeEntry(10002, 'October 1 2020', "Fried tomatoes", 'Edna Lewis', 'Taste of Country Cooking', 'American', '9', '4', ['tomatoes', 'bacon fat', 'bread crumbs', 'flour', 'brown sugar', 'paprikka']));

recipeEntries.push(new RecipeEntry(10003, 'October 3 2020', "Pork chop bun", 'Chris Ying', 'Lucky Peach', 'Macanese', '9', '4', ['bone-in pork chop', 'garlic', 'neutral oil', 'butter', 'Porteguese rolls']));


```

I log them results out to confirm that all entries have, in fact, been correctly made.


## Part Three: Populate your database

I had already set up the DynamoDB in AWS and then I followed the instructions to set up IAM credentials to ensure that I can safely interact with the database without using any API access keys. I modified the starter code to match my table in DynamoDB:

```js
var AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";
var dynamodb = new AWS.DynamoDB();

var params = {};
params.Item = '';
params.TableName = "recipeDiary";
```

Since the requirements for this part are two-fold:  
1.  I need to loop over the entire `recipeEntries` array and then push items from it to the database 
2. I must lag the entries as they are pushed into the database in order to comply with API’s limits

I decide to use the `async` module from last week to achieve this:

```js
const async = require('async');

async.eachSeries(recipeEntries, function(value, callback) {
    var params = {};
    params.Item = value;
    params.TableName = "recipeDiary";
    dynamodb.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });

    setTimeout(callback, 2000);
});
```

I use the `async.eachSeries()` function to loop over each element, `value`, of the `recipeEntries` array and  then ‘put’ it in the DynamoDB database using the API’s ` dynamodb.putItem()` function. 
Then in between each ‘put’, I used the `setTimeout()` function to stall the code for 2 seconds.

The DynamoDB dashboard on AWS then displayed the five entries from the `recipeEntries` array thereby, confirming that all recipes entries were stored in the database successfully.

![](https://raw.githubusercontent.com/shmanzar/data-structures/master/weekly-assignment-05/dynamo_screen.png)


## Final thoughts
In my first iteration of the code, I was getting an error while pushing into the the database:

`InvalidParameterType: Expected params.Item[\'datetime\'].N to be a string\`

This was because while setting up the database, I had specified that the sort key, `datetime`, was a Number  but the API only accepts them in String while putting them in the database.  Moreover, when I pass the recipe entries into the array, I used strings.

I altered the `RecipeEntry` class to account for this: 
```js
this.datetime.N = new Date(datetime).getTime().toString();
```

This makes the dates I passed into the `datetime` parameter first into a JavaScript-compliant date format and then later it is converted into a string using the `toString()` method. This fixed the error.

Looking back, I may have chosen the wrong type for the sort key and it should have been a Number instead. I am happy with the date being in the Epoch format though - it should be fairly trivial to convert it while extracting data from the database using JavaScript’s built-in tools.

