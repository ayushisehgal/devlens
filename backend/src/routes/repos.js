const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db/connection');
const { syncUserRepos } = require('../services/github');

// Sync repos from GitHub
router.post('/sync', auth, async (req, res) => {
  try {
    await syncUserRepos(req.user);
    res.json({ message: 'Sync complete' });
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all repos for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM repos WHERE user_id = $1 ORDER BY stars DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get commit activity for a repo (grouped by date)
router.get('/:repoId/commits', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DATE(committed_at) as date, COUNT(*) as count
       FROM commits
       WHERE repo_id = $1
       GROUP BY DATE(committed_at)
       ORDER BY date ASC`,
      [req.params.repoId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pull requests for a repo
router.get('/:repoId/prs', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM pull_requests
       WHERE repo_id = $1
       ORDER BY opened_at DESC
       LIMIT 20`,
      [req.params.repoId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get language breakdown across all repos
router.get('/stats/languages', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT language, COUNT(*) as count
       FROM repos
       WHERE user_id = $1 AND language IS NOT NULL
       GROUP BY language
       ORDER BY count DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get summary stats (total repos, commits, open PRs, stars)
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const reposResult = await pool.query(
      'SELECT COUNT(*) as total_repos, SUM(stars) as total_stars FROM repos WHERE user_id = $1',
      [req.user.id]
    );

    const commitsResult = await pool.query(
      `SELECT COUNT(*) as total_commits FROM commits c
       JOIN repos r ON r.id = c.repo_id
       WHERE r.user_id = $1
       AND c.committed_at > NOW() - INTERVAL '30 days'`,
      [req.user.id]
    );

    const prsResult = await pool.query(
      `SELECT COUNT(*) as open_prs FROM pull_requests p
       JOIN repos r ON r.id = p.repo_id
       WHERE r.user_id = $1 AND p.state = 'open'`,
      [req.user.id]
    );

    res.json({
      total_repos: reposResult.rows[0].total_repos,
      total_stars: reposResult.rows[0].total_stars || 0,
      commits_30d: commitsResult.rows[0].total_commits,
      open_prs: prsResult.rows[0].open_prs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;