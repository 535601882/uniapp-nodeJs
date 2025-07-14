const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/token/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ code: 401, msg: '未提供refreshToken', data: null });
  }
  try {
    // 校验refreshToken有效性
    const user = jwt.verify(refreshToken, process.env.JWT_SECRET);
    // 生成新token和refreshToken
    const newToken = jwt.sign({ openid: user.openid }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const newRefreshToken = jwt.sign({ openid: user.openid }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ code: 0, msg: 'ok', data: { token: newToken, refreshToken: newRefreshToken } });
  } catch (err) {
    return res.status(401).json({ code: 401, msg: 'refreshToken无效', data: null });
  }
});

module.exports = router; 