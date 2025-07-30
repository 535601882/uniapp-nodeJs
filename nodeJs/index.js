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
const galleryRouter = require('./routes/gallery');
const commonRouter = require('./routes/common');
const connectDB = require('./config/db'); // Added
const app = express();
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    app.use((req, res, next) => {
      console.log('收到请求:', req.originalUrl);
      next();
    });
    app.use(express.json());
    app.use(fileUpload());

    // 增加中间件，校验header是否有token，没有则返回401
    // 增加白名单，白名单中的接口不校验token
    const whiteList = [
      '/api/user/wxlogin',
      '/api/token/refresh',
      '/api/gallery/public',
      '/api/common/content/agreement',
      '/api/common/content/privacy'
    ];
    app.use((req, res, next) => {
      // 跳过不需要校验的路由
      const token = req.headers.authorization?.split(' ')[1]; // 从Bearer token中提取
      console.log("请求路径:",req.originalUrl)
      if(whiteList.includes(req.originalUrl)) {
        return next();
      }
      if (!token) {
        return res.status(401).json({ code: 401, msg: '未提供认证令牌', data: null });
      }
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT 解码后的 req.user:', user); // Added for debugging
        req.user = user;
        next();
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ code: 401, msg: '认证令牌已过期', data: null });
        }
        return res.status(401).json({ code: 401, msg: '认证令牌无效', data: null });
      }
    });

    app.use('/api/chat', chatRouter);
    app.use('/api/image', imageRouter);
    app.use('/api/history', historyRouter);
    app.use('/api/user', userRouter);
    app.use('/api/token', tokenRouter);
    app.use('/api/balance', balanceRouter);
    app.use('/api/user/wxlogin', wxLoginRouter); // Changed
    app.use('/api/gallery', galleryRouter); // Added
    app.use('/api/common', commonRouter);   // Added


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
      console.log(`Express服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start server:', error);
    process.exit(1);
  }
};

startServer();
