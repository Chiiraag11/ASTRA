require("dotenv").config();   // ✅ FIRST LINE

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("ASTRA backend is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0] });
  } catch (error) {
    console.error("DB test error:", error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});