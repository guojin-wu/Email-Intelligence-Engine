const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth');
const apiRoutes = require('./api');

const app = express();
const PORT = process.env.PORT || 3001;
const frontendDir = path.join(__dirname, '../frontend');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendDir));

app.use('/auth/email-helper', authRoutes);
app.use('/api/email-helper', apiRoutes);

app.get('/email-analyzer', (req, res) => {
  res.redirect(302, '/');
});

app.get('/email-analyzer.html', (req, res) => {
  res.redirect(302, '/');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'email-helper', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Email Helper running on http://localhost:${PORT}`);
  });
}

module.exports = app;
