const express = require('express');
const router = express.Router();
const CreditRecord = require('../models/CreditRecord'); // 引入CreditRecord模型

// 积分套餐模拟数据 (静态数据，无需数据库)
const mockCreditPackages = [
  { id: 'pkg_1', title: '新手包', credits: 100, price: 6.00, currency: 'CNY' },
  { id: 'pkg_2', title: '创作者捆绑包', credits: 550, price: 30.00, currency: 'CNY', popular: true },
  { id: 'pkg_3', title: '专业包', credits: 1200, price: 60.00, currency: 'CNY' },
];

/**
 * GET /api/credits/records
 * 获取积分交易记录，支持分页。
 * 查询参数: ?page=1&limit=15
 */
router.get('/records', async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  const userId = req.user.id; // 从JWT中获取用户ID

  try {
    const records = await CreditRecord.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CreditRecord.countDocuments({ user: userId });

    res.json({
      code: 0,
      msg: '成功',
      data: {
        items: records,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    console.error('获取积分记录失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * GET /api/credits/packages
 * 获取积分购买套餐。
 */
router.get('/packages', (req, res) => {
  res.json({ code: 0, msg: '成功', data: { packages: mockCreditPackages } });
});

module.exports = router;
