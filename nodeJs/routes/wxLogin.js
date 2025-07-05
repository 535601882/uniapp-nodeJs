const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const generateToken = (openid) => {
  return jwt.sign({ openid }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

router.post('/',async  (req, res) => {
  const { code } = req.body;
  const appid = process.env.APPID;
  const secret = process.env.APPSECRET;

  try {
    // 1. 用code换取openid和session_key
    const result = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    );

    const { openid, session_key, unionid } = result.data;
    
    // 2. 根据openid查询或创建用户（数据库操作）
    // const user = await db.findOrCreateUser({ openid, unionid });

    // 3. 生成自定义登录态（如JWT）
    const token = generateToken(openid);

    // 假数据
    const user = {  
        openid,
        nickname: '测试用户',
        avatar: 'https://cdn.jsdelivr.net/gh/baimingxuan/media-host@master/img/avatar.png',
        token: token,
        email: 'test@example.com',
    };
    // 4. 返回token给前端
    res.json({ ...user });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;