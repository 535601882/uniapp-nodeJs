const express = require('express');
const router = express.Router();

// GET /api/user/:openid
router.get('/:openid', (req, res) => {
  const { openid } = req.params;
  // 假数据
  const user = {
    openid,
    nickname: '测试用户',
    avatar: 'https://cdn.jsdelivr.net/gh/baimingxuan/media-host@master/img/avatar.png',
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    email: 'test@example.com',
  };
  res.json({ code: 0, msg: 'ok', data: user });
});

module.exports = router; 