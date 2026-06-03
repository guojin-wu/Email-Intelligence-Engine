const express = require('express');
const {
  inbox,
  state,
  analyzeEmail,
  createScheduledEmail
} = require('./store');

const router = express.Router();

function requireConnection(res) {
  if (state.connected) return true;
  res.status(401).json({
    error: 'Email helper is not connected yet. Open /auth/email-helper/connect first.',
    connected: false,
    mode: 'demo'
  });
  return false;
}

router.get('/status', (req, res) => {
  res.json({
    connected: state.connected,
    mode: 'demo',
    provider: 'gmail'
  });
});

router.get('/messages', (req, res) => {
  if (!requireConnection(res)) return;
  const count = Math.max(1, Math.min(parseInt(req.query.count, 10) || 20, inbox.length));
  res.json(inbox.slice(0, count));
});

router.post('/analyze-batch', (req, res) => {
  if (!requireConnection(res)) return;
  const emails = Array.isArray(req.body && req.body.emails) ? req.body.emails : [];
  const results = emails.map((email) => ({
    id: email.id,
    analysis: analyzeEmail(email)
  }));
  res.json({
    mode: 'demo',
    results
  });
});

router.post('/send', (req, res) => {
  if (!requireConnection(res)) return;
  const { to, subject, body } = req.body || {};
  if (!to || !subject) {
    return res.status(400).json({ error: 'Both "to" and "subject" are required.' });
  }

  state.sentEmails.push({
    to,
    subject,
    body: body || '',
    sentAt: new Date().toISOString()
  });

  return res.json({
    sent: true,
    mode: 'demo'
  });
});

router.post('/schedule', (req, res) => {
  if (!requireConnection(res)) return;
  const { to, subject, body, sendAt } = req.body || {};
  if (!to || !subject || !sendAt) {
    return res.status(400).json({ error: '"to", "subject", and "sendAt" are required.' });
  }

  const entry = createScheduledEmail({ to, subject, body, sendAt });
  state.scheduledEmails.unshift(entry);

  return res.status(201).json({
    scheduled: true,
    email: entry,
    mode: 'demo'
  });
});

router.get('/scheduled', (req, res) => {
  if (!requireConnection(res)) return;
  res.json(state.scheduledEmails);
});

router.delete('/scheduled/:id', (req, res) => {
  if (!requireConnection(res)) return;
  const target = state.scheduledEmails.find((item) => item.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Scheduled email not found.' });
  }

  target.status = 'failed';
  target.sentAt = new Date().toISOString();

  return res.json({
    cancelled: true,
    id: target.id
  });
});

router.get('/digest', (req, res) => {
  if (!requireConnection(res)) return;
  res.json(state.digestConfig);
});

router.post('/digest', (req, res) => {
  if (!requireConnection(res)) return;
  const nextConfig = req.body || {};
  state.digestConfig = {
    ...state.digestConfig,
    enabled: Boolean(nextConfig.enabled),
    time: nextConfig.time || state.digestConfig.time,
    emailCount: Number.isFinite(nextConfig.emailCount) ? nextConfig.emailCount : state.digestConfig.emailCount
  };
  res.json({
    saved: true,
    config: state.digestConfig
  });
});

router.post('/digest/run', (req, res) => {
  if (!requireConnection(res)) return;
  const emailCount = Math.max(1, Math.min(state.digestConfig.emailCount, inbox.length));
  const analyzed = inbox.slice(0, emailCount).map(analyzeEmail);
  const important = analyzed.filter((item) => item.is_important).length;
  state.digestConfig.lastRun = new Date().toISOString();

  res.json({
    sent: true,
    to: 'demo@portfolio.local',
    emailsAnalyzed: emailCount,
    important,
    mode: 'demo'
  });
});

module.exports = router;
