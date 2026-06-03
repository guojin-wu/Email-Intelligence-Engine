const express = require('express');
const { state } = require('./store');

const router = express.Router();

router.get('/connect', (req, res) => {
  state.connected = true;
  res.redirect('/email-helper/');
});

router.post('/disconnect', (req, res) => {
  state.connected = false;
  res.json({
    connected: false,
    mode: 'demo'
  });
});

module.exports = router;
