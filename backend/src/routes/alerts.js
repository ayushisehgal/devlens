const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db/connection');

// Get stale PRs (open more than 48 hours)
router.get('/stale-prs', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, r.name as repo_name
       FROM pull_requests p
       JOIN repos r ON r.id = p.repo_id
       WHERE r.user_id = $1
       AND p.state = 'open'
       AND p.opened_at < NOW() - INTERVAL '48 hours'
       ORDER BY p.opened_at ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;