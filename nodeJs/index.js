require('dotenv').config();
const express = require('express');
const axios = require('axios');
const chatRouter = require('./routes/chat');
const imageRouter = require('./routes/image');
const historyRouter = require('./routes/history');
const userRouter = require('./routes/user');
const tokenRouter = require('./routes/token');
const balanceRouter = require('./routes/balance');
const wxLoginRouter = require('./routes/wxLogin');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

// 增加中间件，校验header是否有token，没有则返回401
// 增加白名单，白名单中的接口不校验token
const whiteList = ['/api/wxlogin'];
app.use((req, res, next) => {
  const token = req.headers.token;
  console.log("req.originalUrl",req.originalUrl)
  if(whiteList.includes(req.originalUrl)) {
    next();
    return;
  }
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未授权', data: null });
  }
  // 校验token是否有效
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ code: 401, msg: '未授权', data: null });
  }
  next();
});

app.use('/api/chat', chatRouter);
app.use('/api/image', imageRouter);
app.use('/api/history', historyRouter);
app.use('/api/user', userRouter);
app.use('/api/token', tokenRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/wxlogin', wxLoginRouter);

// 统一404
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('服务异常:', err);
  res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
}); 