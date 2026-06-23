require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const router = express.Router();

// Step 1: Redirect to GitHub login
router.get('/github', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,read:user`;
  res.redirect(url);
});

// Step 2: GitHub sends back a code
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    if (tokenRes.data.error) {
      console.warn('Token exchange failed (likely duplicate request):', tokenRes.data.error);
      return res.redirect(`${process.env.FRONTEND_URL}/`);
    }

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });

    const ghUser = userRes.data;

    const result = await pool.query(
      `INSERT INTO users (github_id, username, avatar_url, access_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (github_id)
       DO UPDATE SET access_token = $4, username = $2, avatar_url = $3
       RETURNING *`,
      [ghUser.id, ghUser.login, ghUser.avatar_url, accessToken]
    );

    const user = result.rows[0];

    const jwtToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${jwtToken}`);

  } catch (err) {
    console.error('OAuth error full:', err.response?.data || err.message);
    return res.redirect(`${process.env.FRONTEND_URL}/`);
  }
});

// Get current logged-in user
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatar_url: req.user.avatar_url
  });
});

module.exports = { router };