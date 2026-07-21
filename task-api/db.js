const { Pool } = require('pg');

// One place for all Postgres access (repository)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  // Confirm we can reach Postgres
  await pool.query('SELECT 1');

  // Create the tasks table if it does not already exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `);

  // Seed three example tasks ONLY if the table is empty
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM tasks');
  if (rows[0].count === 0) {
    await pool.query(
      `INSERT INTO tasks (title, done) VALUES
        ($1, $2),
        ($3, $4),
        ($5, $6)`,
      [
        'Set up the server', true,
        'Build read endpoints', false,
        'Ship to GitHub', false,
      ]
    );
    console.log('Seeded Postgres with initial tasks.');
  }

  console.log('Connected to Postgres.');
}

module.exports = { pool, initDb };
