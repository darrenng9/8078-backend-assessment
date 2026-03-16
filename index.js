const express = require("express");
const mysql2 = require("mysql2/promise");
const ejs = require("ejs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}

const dbConnection = mysql2.createPool(dbConfig);

app.use(express.urlencoded({ extended: true}));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", async (req, res) => {
    const [rows] = await dbConnection.query("SELECT * FROM food_entries");
    res.render("index", { foodEntries: rows });
});

app.get("/food-entry/add", function(req,res){
    res.render('create-food-entry');
});

app.post("/food-entry/add", async (req,res) => {
    const { dateTime, foodName, calories, meal, tags, servingSize, unit } = req.body;
    const query = "INSERT INTO food_entries (dateTime, foodName, calories, meal, tags, servingSize, unit) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [dateTime, foodName, calories, meal, JSON.stringify(tags), servingSize, unit];
    console.log(values);
    await dbConnection.execute(query, values);
    res.redirect("/");
    console.log(dateTime, foodName, calories, meal, tags, servingSize, unit);
    res.send("Food entry added successfully");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});