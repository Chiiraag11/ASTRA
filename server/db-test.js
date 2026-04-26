const pool = require("./db");

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ DB connected! Time from Postgres:", result.rows[0]);
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  } finally {
    await pool.end();
  }
}

test();
