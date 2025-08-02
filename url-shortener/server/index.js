// server/index.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
app.use(cors());
app.use(express.json());

let urlDatabase = {};

const DEFAULT_VALIDITY_MINUTES = 30;

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date()}] ${req.method} ${req.url}`);
  next();
});

// Shorten URL
app.post('/shorten', (req, res) => {
  const { longUrl, customCode, validity } = req.body;
  const code = customCode || uuidv4().slice(0, 6);
  const createdAt = new Date();
  const expiry = moment(createdAt).add(validity || DEFAULT_VALIDITY_MINUTES, 'minutes').toDate();

  if (urlDatabase[code]) return res.status(400).json({ error: 'Code already in use' });

  urlDatabase[code] = { longUrl, createdAt, expiry, clicks: [] };
  res.json({ shortUrl: `http://localhost:5000/${code}` });
});

// Redirect
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlDatabase[code];

  if (!entry) return res.status(404).send('Not found');
  if (new Date() > new Date(entry.expiry)) return res.status(410).send('URL expired');

  entry.clicks.push({
    timestamp: new Date(),
    ip: req.ip,
  });

  res.redirect(entry.longUrl);
});

// Get stats
app.get('/stats', (req, res) => {
  res.json(urlDatabase);
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));