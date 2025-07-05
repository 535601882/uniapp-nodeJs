const express = require('express');
const router = express.Router();

// POST /api/token/refresh
router.post('/refresh', (req, res) => {
  // 假数据
  const newToken = 'test-token-' + Date.now();
  res.json({ code: 0, msg: 'ok', data: { token: newToken } });
});

module.exports = router; 