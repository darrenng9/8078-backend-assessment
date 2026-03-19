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

async function testConnection() {
    try {
        const conn = await dbConnection.getConnection();
        console.log("Database connected");
        conn.release();
    } catch (err) {
        console.error("Database connection failed", err.message);
        process.exit(1);
    }
}
testConnection();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", async (req, res) => {
    res.send("Hello World");
});
// app.get("/", async (req, res) => {
//     try {
//         const sql = `SELECT * FROM food_entries JOIN meals ON food_entries.meal_id = meals.id`;
//         const results = await dbConnection.execute({ sql, nestTables: true });
//         const [rows] = results[0];
//         res.render("index", { foodEntries: rows });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Server error: " + err.message);
//     }
// });

app.get("/food-entries", async (req, res) => {
    try {
        const sql = `SELECT * FROM food_entries JOIN meals ON
        food_entries.meal_id = meals.id
        `;
        const results = await dbConnection.execute({
            sql: sql,
            nestTables: true
        });
        const rows = results[0];

        res.render('food_entries', {
            foodEntries: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.get("/food-entry/add", async (req, res) => {
    try {
        const [meals] = await dbConnection.execute("SELECT * FROM meals");
        res.render('create-food-entry', {
            'meals': meals
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.post("/food-entry/add", async (req, res) => {
    try {
        const { dateTime, foodName, calories, meal_id, tags, servingSize, unit } = req.body;
        const query = "INSERT INTO food_entries (dateTime, foodName, calories, meal_id, tags, servingSize, unit) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [dateTime, foodName, calories, meal_id, JSON.stringify(tags), servingSize, unit];
        console.log(values);
        await dbConnection.execute(query, values);
        res.redirect("/");
        console.log(dateTime, foodName, calories, meal_id, tags, servingSize, unit);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.get("/food-entry/:id/edit", async (req, res) => {
    try {
        const [rows] = await dbConnection.query("SELECT * FROM food_entries WHERE id = ?", [req.params.id]);
        const [meals] = await dbConnection.execute("SELECT * FROM meals");
        const foodEntry = rows[0];
        foodEntry.tags = JSON.parse(foodEntry.tags);
        res.render("edit-food-entry", { foodEntry, meals });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.post("/food-entry/:id/edit", async (req, res) => {
    try {
        let { dateTime, foodName, calories, meal_id, tags, servingSize, unit } = req.body;
        if (!tags) {
            tags = [];
        }
        const query = "UPDATE food_entries SET dateTime = ?, foodName = ?, calories = ?, meal_id = ?, tags = ?, servingSize = ?, unit = ? WHERE id = ?";
        const values = [dateTime, foodName, calories, meal_id, JSON.stringify(tags), servingSize, unit, req.params.id];
        await dbConnection.execute(query, values);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.get("/food-entry/:id/delete", async (req, res) => {
    try {
        const [rows] = await dbConnection.query("SELECT * FROM food_entries WHERE id = ?", [req.params.id]);
        res.render("delete-food-entry", {
            foodEntry:
                rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.post("/food-entry/:id/delete", async (req, res) => {
    try {
        await dbConnection.execute("DELETE FROM food_entries WHERE id = ?", [req.params.id]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error: " + err.message);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});