const axios = require('axios');
const { pool } = require('../db/connection');

async function syncUserRepos(user) {
  const headers = { Authorization: `token ${user.access_token}` };

  console.log(`Syncing repos for user: ${user.username}`);

  // Fetch repos from GitHub
  const { data: repos } = await axios.get(
    'https://api.github.com/user/repos?per_page=50&sort=updated',
    { headers }
  );

  for (const repo of repos) {
    // Upsert repo
    const result = await pool.query(
      `INSERT INTO repos (user_id, github_repo_id, name, full_name, language, stars, forks, open_issues, last_synced)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (github_repo_id)
       DO UPDATE SET
         stars = $6,
         forks = $7,
         open_issues = $8,
         last_synced = NOW()
       RETURNING id`,
      [
        user.id,
        repo.id,
        repo.name,
        repo.full_name,
        repo.language,
        repo.stargazers_count,
        repo.forks_count,
        repo.open_issues_count
      ]
    );

    const repoId = result.rows[0].id;

    // Fetch commits
    try {
      const { data: commits } = await axios.get(
        `https://api.github.com/repos/${repo.full_name}/commits?per_page=30`,
        { headers }
      );

      for (const c of commits) {
        await pool.query(
          `INSERT INTO commits (repo_id, sha, message, author, committed_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (sha) DO NOTHING`,
          [
            repoId,
            c.sha,
            c.commit.message.slice(0, 200),
            c.commit.author.name,
            c.commit.author.date
          ]
        );
      }
    } catch (e) {
      // Empty repo or no access — skip silently
    }

    // Fetch pull requests
    try {
      const { data: prs } = await axios.get(
        `https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=20`,
        { headers }
      );

      for (const pr of prs) {
        await pool.query(
          `INSERT INTO pull_requests (repo_id, pr_number, title, state, opened_at, closed_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [
            repoId,
            pr.number,
            pr.title,
            pr.state,
            pr.created_at,
            pr.closed_at
          ]
        );
      }
    } catch (e) {
      // Skip silently
    }
  }

  console.log(`✅ Sync complete for ${user.username}`);
}

module.exports = { syncUserRepos };