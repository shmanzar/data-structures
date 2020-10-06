const async = require('async');
var AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();



var recipeEntries = [];

class RecipeEntry {
    constructor(recipeID, datetime, recipeTitle, author, book, cuisine, rating, servings, ingredientList, imageLink) {
        this.recipeID = {};
        this.recipeID.N = recipeID.toString();
        this.datetime = {};
        // this.datetime.S = new Date(datetime).toDateString();
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

recipeEntries.push(new RecipeEntry(10001, 'September 28 2020', "Pork liver and leeks", 'Fergus Henderson', 'Nose to Tail', 'British', '9', '6', ['pork liver', 'leeks', 'butter', 'brandy', 'stock', 'paprikka']));
recipeEntries.push(new RecipeEntry(10001, 'September 30 2020', "Roast bone marrow and parsely salad", 'Fergus Henderson', 'Nose to Tail', 'British', '10', '2', ['veal marrowbones', 'parsely', 'shallots', 'capers', 'toast', 'olive oil', 'Maldon salt']));
recipeEntries.push(new RecipeEntry(10002, 'October 2  2020', "Lentils and scallion salad", 'Edna Lewis', 'Taste of Country Cooking', 'American', '9', '4', ['lentils', 'scallions', 'olive oil', 'mustard', 'ham', 'white wine vinegar']));
recipeEntries.push(new RecipeEntry(10002, 'October 1 2020', "Fried tomatoes", 'Edna Lewis', 'Taste of Country Cooking', 'American', '9', '4', ['tomatoes', 'bacon fat', 'bread crumbs', 'flour', 'brown sugar', 'paprikka']));
recipeEntries.push(new RecipeEntry(10003, 'October 3 2020', "Pork chop bun", 'Chris Ying', 'Lucky Peach', 'Macanese', '9', '4', ['bone-in pork chop', 'garlic', 'neutral oil', 'butter', 'Porteguese rolls']));

console.log(recipeEntries);

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
