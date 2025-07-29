
const express = require('express');
const router = express.Router();

/**
 * POST /api/feedback
 * 提交用户反馈。
 */
router.post('/feedback', (req, res) => {
  const { content, contact } = req.body;
  if (!content) {
    return res.status(400).json({ code: 400, msg: '反馈内容不能为空。' });
  }
  console.log('收到反馈:', { content, contact });
  // 模拟保存
  res.json({ code: 0, msg: '反馈已收到，感谢您的支持！' });
});

/**
 * GET /api/notifications/latest
 * 获取最新系统通知。
 */
router.get('/notifications/latest', (req, res) => {
  res.json({
    code: 0,
    msg: '成功',
    data: {
      id: 'noti_123',
      content: '全新“赛博朋克2.0”风格模型已上线！快来体验吧！',
      has_read: false,
    }
  });
});

/**
 * GET /api/content/agreement
 * 获取用户协议内容。
 */
router.get('/content/agreement', (req, res) => {
  res.json({
    code: 0,
    msg: '成功',
    data: {
      title: '用户协议',
      content: `
# 用户协议

最后更新: 2025-07-29

欢迎使用我们的AI创作应用！

1.  **服务描述:** 本服务使用AI根据用户提示生成图像。
2.  **用户行为:** 您同意不创建任何有害、冒犯性或侵权内容。
3.  **所有权:** 您拥有您创建的图像，但授予我们许可在应用程序内（例如，在公共画廊中）显示它们。
... 更多内容 ...
      `
    }
  });
});

/**
 * GET /api/content/privacy
 * 获取隐私政策内容。
 */
router.get('/content/privacy', (req, res) => {
  res.json({
    code: 0,
    msg: '成功',
    data: {
      title: '隐私政策',
      content: `
# 隐私政策

最后更新: 2025-07-29

我们致力于保护您的隐私。

1.  **我们收集的信息:** 我们收集您的微信昵称和头像用于显示。我们还会存储您的创作。
2.  **我们如何使用信息:** 用于提供和改进服务。
3.  **信息共享:** 我们不会与第三方共享您的个人信息，除非您选择公开的内容。
... 更多内容 ...
      `
    }
  });
});

module.exports = router;
