const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function connectDB() {
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      github_id BIGINT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      access_token TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS repos (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      github_repo_id BIGINT UNIQUE,
      name TEXT,
      full_name TEXT,
      language TEXT,
      stars INT DEFAULT 0,
      forks INT DEFAULT 0,
      open_issues INT DEFAULT 0,
      last_synced TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS commits (
      id SERIAL PRIMARY KEY,
      repo_id INT REFERENCES repos(id),
      sha TEXT UNIQUE,
      message TEXT,
      author TEXT,
      committed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS pull_requests (
      id SERIAL PRIMARY KEY,
      repo_id INT REFERENCES repos(id),
      pr_number INT,
      title TEXT,
      state TEXT,
      opened_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ
    );
  `);
  client.release();
  console.log('✅ Database connected and tables ready');
}

module.exports = { pool, connectDB };