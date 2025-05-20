const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

//Serve the frontend
app.use(express.static(path.join()))
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
    user: "postgres",
    host: "127.0.0.1",
    database: "postgres",
    password: "1234",
    port: 5432,
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
    if(err) console.error("Error connecting to PostgreSQL:", err);
    else console.log("Connected to PostgreSQL at:", res.rows[0].now);
});

// API Routes
app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM expenses ORDER BY date DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: err.message });
    }
});

app.post("/api/expenses", async (req, res) => {
    const { title, amount, category } = req.body;
    try{
        const result = await pool.query(
            "INSERT INTO expenses (title, amount, category) VALUES ($1, $2, $3) RETURNING *",
        [title, amount, category]
    );
    res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an expense
app.delete("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
        res.json({ message: "Expense deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});