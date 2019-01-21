//jshint esversion:6

const express = require("express"); // Require the express package.
const bodyParser = require("body-parser"); // Require the body-parser package.
const mongoose = require("mongoose"); // Require the mongoose package.
const _ = require("lodash"); // Require lodash.
// const date = require(__dirname + "/date.js"); // Require our custom module date.js.

const app = express(); // Create app constant using Express.

app.set("view engine", "ejs"); // Use EJS as view engine.

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Create database and establish connection.
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// Create a Mongoose schema.
const itemsSchema = {
  name: String
};

// Create a Mongoose model.
const Item = mongoose.model("Item", itemsSchema);

// Create new documents.
const item1 = new Item({
  name: "Welcome to your To Do List!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// Create a Mongoose schema.
const listSchema = {
  name: String,
  items: [itemsSchema]
};

// Create a Mongoose model.
const List = mongoose.model("List", listSchema);

// Set the GET routes. Render database items in the ToDoList app.
app.get("/", function(req, res) { // Set the GET route.

  Item.find({}, function(err, foundItems) {
    // const day = date.getDate();

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Succesfully saved default items to DB.");
          }
      });
      res.redirect("/");
    } else {
      // Render the list.ejs file and pass the var day and array items.
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err){
      if(!foundList){
        // Create a new list.
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list.
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});

// Set the POST routes.
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err) {
        console.log(err);
      } else {
        console.log("Succesfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.listen(3000, function() {
  console.log("Server is running on port 3000."); // Set the server to listen on port 3000.
});
