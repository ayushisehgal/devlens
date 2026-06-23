require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { router: authRouter } = require('./routes/auth');
const repoRouter = require('./routes/repos');
const alertRouter = require('./routes/alerts');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/repos', repoRouter);
app.use('/api/alerts', alertRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

module.exports = app;