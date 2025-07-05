const express = require('express');
const router = express.Router();
const { getHistory } = require('../utils/historyStore');

// GET /api/history/:openid
router.get('/:openid', (req, res) => {
  const { openid } = req.params;
  const history = getHistory(openid);
  res.json({ code: 0, msg: 'ok', data: { history } });
});

module.exports = router; 