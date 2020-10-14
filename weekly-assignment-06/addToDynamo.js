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

recipeEntries.push(new RecipeEntry(10001, 'October 9 2020', "Pork scratchings", 'Fergus Henderson', 'Nose to Tail', 'British', '9', '4', ['pork skin', 'sea salt', 'duck fat'], 'https://www.seriouseats.com/recipes/images/20090922-pig-skin-fin.jpg'));
recipeEntries.push(new RecipeEntry(10001, 'October 11 2020', "Roast pigeons", 'Fergus Henderson', 'Nose to Tail', 'British', '8', '1', ['plump pigeon', 'sea salt', 'butter', 'sage'], 'https://honest-food.net/wp-content/uploads/2014/12/roast-pigeon.jpg'));
recipeEntries.push(new RecipeEntry(10002, 'October 5  2020', "Green tomato preserves", 'Edna Lewis', 'Taste of Country Cooking', 'American', '9', '12', ['green tomatoes', 'sugar', 'lemon']));
recipeEntries.push(new RecipeEntry(10002, 'October 7 2020', "Scalloped potatoes", 'Edna Lewis', 'Taste of Country Cooking', 'American', '9', '8', ['white potatoes', 'black pepper', 'butter', 'beef stock', 'salt']));
recipeEntries.push(new RecipeEntry(10003, 'October 13 2020', "Miso-glazed eggplant", 'Chris Ying', 'Lucky Peach', 'Japanese', '8', '6', ['Japanese eggplants', 'red miso', 'neutral oil', 'mirin', 'sesame seeds'], 'https://static01.nyt.com/images/2013/09/14/science/16recipehealth/16recipehealth-articleLarge.jpg'));

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
