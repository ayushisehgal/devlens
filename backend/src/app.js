require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');

const { router: authRouter } = require('./routes/auth');
const repoRouter = require('./routes/repos');
const alertRouter = require('./routes/alerts');

const app = express();

client.collectDefaultMetrics();

// Custom metric: track HTTP requests by route and status
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

app.use('/auth', authRouter);
app.use('/api/repos', repoRouter);
app.use('/api/alerts', alertRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/metrics', async (req, res) => {
  const auth = req.headers.authorization;
  const expected = 'Basic ' + Buffer.from(`metrics:${process.env.METRICS_PASSWORD}`).toString('base64');

  if (auth !== expected) {
    res.set('WWW-Authenticate', 'Basic realm="metrics"');
    return res.status(401).send('Authentication required');
  }

  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = app;