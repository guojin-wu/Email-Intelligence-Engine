const { randomUUID } = require('crypto');

const inbox = [
  {
    id: 'msg_1',
    from: 'sarah@acme.co',
    subject: 'Server down - need immediate fix',
    snippet: 'Production is failing health checks and customers cannot log in.',
    body: 'Production is failing health checks and customers cannot log in. Please investigate right away and reply with an ETA.'
  },
  {
    id: 'msg_2',
    from: 'mike@ops.io',
    subject: 'Q2 budget review attached',
    snippet: 'Please review the updated budget before tomorrow morning.',
    body: 'Please review the updated budget before tomorrow morning. I highlighted the vendor overages on page two.'
  },
  {
    id: 'msg_3',
    from: 'noreply@github.com',
    subject: 'PR #847 merged to main',
    snippet: 'Your pull request has been merged successfully.',
    body: 'Your pull request has been merged successfully. No further action is required.'
  },
  {
    id: 'msg_4',
    from: 'news@techbrief.io',
    subject: 'Weekly AI digest - May 2026',
    snippet: 'A roundup of the top AI stories and product launches this week.',
    body: 'A roundup of the top AI stories and product launches this week. You can archive after skimming.'
  },
  {
    id: 'msg_5',
    from: 'lisa@vendor.com',
    subject: 'Contract renewal - sign by Friday',
    snippet: 'The renewal paperwork is attached and needs your review.',
    body: 'The renewal paperwork is attached and needs your review. Please sign by Friday to avoid a lapse in service.'
  }
];

const state = {
  connected: false,
  scheduledEmails: [],
  sentEmails: [],
  digestConfig: {
    enabled: false,
    time: '08:00',
    emailCount: 30,
    lastRun: null
  }
};

function textFor(email) {
  return [email.from, email.subject, email.snippet, email.body].join(' ').toLowerCase();
}

function pickCategory(text) {
  if (/(invoice|budget|payment|contract|renewal|billing)/.test(text)) return 'finance';
  if (/(server|production|client|deploy|meeting|project|fix)/.test(text)) return 'work';
  if (/(newsletter|digest|roundup|weekly)/.test(text)) return 'newsletter';
  if (/(noreply|notification|merged|alert|health check)/.test(text)) return 'notification';
  if (/(family|birthday|friend|personal)/.test(text)) return 'personal';
  if (/(winner|claim now|lottery|free money|unsubscribe)/.test(text)) return 'spam';
  return 'work';
}

function pickPriority(text) {
  if (/(server down|immediate|urgent|asap|cannot log in|failing)/.test(text)) return 'high';
  if (/(review|budget|contract|renewal|attached|tomorrow)/.test(text)) return 'medium';
  return 'low';
}

function pickAction(text, category) {
  if (/(invoice|payment|billing)/.test(text)) return 'pay';
  if (/(review|attached|sign|contract|renewal)/.test(text)) return 'review';
  if (/(reply|respond|eta|please investigate|need)/.test(text)) return 'reply';
  if (/(job|application|apply)/.test(text)) return 'apply';
  if (category === 'newsletter' || category === 'notification') return 'archive';
  if (category === 'spam') return 'delete';
  return 'review';
}

function summarize(email) {
  const source = email.snippet || email.body || email.subject || '';
  const trimmed = source.trim().replace(/\s+/g, ' ');
  return trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed;
}

function analyzeEmail(email) {
  const text = textFor(email);
  const category = pickCategory(text);
  const priority = pickPriority(text);
  return {
    is_important: priority === 'high' || /(contract|renewal|budget|payment)/.test(text),
    priority,
    category,
    summary: summarize(email),
    action: pickAction(text, category)
  };
}

function createScheduledEmail({ to, subject, body, sendAt }) {
  return {
    id: randomUUID(),
    to,
    subject,
    body: body || '',
    sendAt,
    status: 'pending',
    createdAt: new Date().toISOString(),
    sentAt: null
  };
}

module.exports = {
  inbox,
  state,
  analyzeEmail,
  createScheduledEmail
};
