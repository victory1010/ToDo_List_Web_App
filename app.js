//jshint esversion:6

const express = require("express"); // Require the express package.
const bodyParser = require("body-parser"); // Require the body-parser package.
const date = require(__dirname + "/date.js"); // Require our custom module date.js.

const app = express(); // Create app constant using Express.

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.set("view engine", "ejs"); // Use EJS as view engine.

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) { // Set the GET route.

  const day = date.getDate();

  // Render the list.ejs file and pass the var day and array items.
  res.render("list", {
    listTitle: day,
    newListItems: items
  });

});

app.post("/", function(req, res) {

  console.log(req.body);

  const item = req.body.newItem;

  if (req.body.list === "Work List") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }

});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.listen(3000, function() {
  console.log("Server is running on port 3000."); // Set the server to listen on port 3000.
});
