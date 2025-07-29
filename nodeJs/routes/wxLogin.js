const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 引入User模型

// token 生成
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token有效期延长到1小时
};
// 刷新token 生成
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' }); // Refresh Token有效期7天
};

router.post('/', async (req, res) => {
  const { code } = req.body;
  const appid = process.env.APPID;
  const secret = process.env.APPSECRET;

  try {
    // 1. 用code换取openid和session_key
    const result = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    );

    console.log('result.data',result.data)
    const { openid, session_key, unionid } = result.data;

    if (!openid) {
      return res.status(400).json({ code: 400, msg: '获取openid失败', data: null });
    }

    // 2. 根据openid查询或创建用户
    let user = await User.findOne({ openid });

    if (!user) {
      // 如果用户不存在，则创建新用户
      user = await User.create({
        openid,
        nickname: `微信用户_${openid.substring(0, 8)}`, // 初始昵称
        avatar_url: `https://i.pravatar.cc/150?u=${openid}`, // 初始头像
        credits: 100, // 初始积分
      });
    }

    // 3. 生成自定义登录态（如JWT）
    const token = generateToken(user._id);
    // 4. 刷新token
    const refreshToken = generateRefreshToken(user._id);

    // 5. 返回token和用户信息给前端
    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        refreshToken,
        nickname: user.nickname,
        avatar: user.avatar_url,
        credits: user.credits, // 返回用户积分
      },
    });
  } catch (err) {
    console.error('微信登录服务异常:', err.response?.data || err.message);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;
