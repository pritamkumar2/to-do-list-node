// import neccessary npm module and run express
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ///////////////////////////

// conection for mongodb and create an db
const uri = "mongodb://127.0.0.1/toList";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
/////////////////////////

// creating a schema to create format of collection
const itemList = new mongoose.Schema({
  name: String,
});

/////create a collection
const product = new mongoose.model("Item", itemList);
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemList],
});
const List = new mongoose.model("List", listSchema);
const item1 = new product({
  name: "Welcome to your todolist!",
});

const item2 = new product({
  name: "Hit the + button to add a new item.",
});

const item3 = new product({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];
// /////////

// array to find week month day etc
const weeks = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const yearMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let days = new Date();
const year = days.getFullYear();
const month = yearMonths[days.getMonth()];
const day = days.getDay();
const today = weeks[day];

/////////////////////////////////////
// create an route and endpoint
app.get("/:path", async (req, res) => {
  const userId = req.params.path;
  const i = List.find({ name: userId });
  if (!i) {
    List.insertMany({
      name: userId,
      items: defaultItems,
    });
  } else {
    console.log(i.name);
  }
});
app.get("/", async (req, res) => {
  try {
    // Fetch the list data from the database
    const data = await product.find();
    // send file to index.ejs
    res.render("../view/index.ejs", {
      day: today,
      month: month,
      year: year,
      newLiItems: data,
    });
    /////////////
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

////////////////////////

///////getting data form the form

app.post("/", async (req, res) => {
  let newTask = req.body.newItem;
  console.log(newTask);

  const trimmedString = newTask.trim();

  if (trimmedString === "") {
    // If the trimmed string is empty, log a message
    console.log("String is empty");
    res.redirect("/");
  } else {
    try {
      // Insert the new item into the database
      await product.create({ name: newTask });

      // Fetch the updated list data from the database
      const updatedData = await product.find();
      console.log(updatedData);

      res.render("../view/index.ejs", {
        day: today,
        month: month,
        year: year,
        newLiItems: updatedData, // Update the template with the new data
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
});
// delete the list items
app.post("/delete", async (req, res) => {
  const check = req.body.checker;

  try {
    // Use findOneAndDelete to find and delete the object by name
    const deletedItem = await product.findOneAndDelete({ name: check });

    if (!deletedItem) {
      console.log(`Item with name '${check}' not found.`);
    } else {
      console.log(`Item with name '${check}' deleted successfully.`);
    }
    // Send the updated data to the client
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// running the server on port 3000
app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`);
});
