const express = require('express');
const router = express.Router();
const Creation = require('../models/Creation'); // 引入Creation模型

/**
 * GET /api/history
 * 获取用户创作历史，支持分页。
 * 查询参数: ?page=1&limit=10
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id; // 从JWT中获取用户ID

  try {
    const creations = await Creation.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Creation.countDocuments({ user: userId });

    res.json({
      code: 0,
      msg: '成功',
      data: {
        items: creations,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    console.error('获取用户创作历史失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * GET /api/history/:id
 * 获取单条历史记录详情。
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 从JWT中获取用户ID

  try {
    const creation = await Creation.findOne({ _id: id, user: userId });
    if (!creation) {
      return res.status(404).json({ code: 404, msg: '历史记录未找到', data: null });
    }
    res.json({ code: 0, msg: '成功', data: creation });
  } catch (error) {
    console.error('获取历史记录详情失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * DELETE /api/history/:id
 * 删除一条历史记录。
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 从JWT中获取用户ID

  try {
    const result = await Creation.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ code: 404, msg: '历史记录未找到或无权删除', data: null });
    }
    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (error) {
    console.error('删除历史记录失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * PUT /api/history/:id/visibility
 * 设置历史记录的可见性。
 */
router.put('/:id/visibility', async (req, res) => {
  const { id } = req.params;
  const { is_public } = req.body;
  const userId = req.user.id; // 从JWT中获取用户ID

  if (typeof is_public !== 'boolean') {
    return res.status(400).json({ code: 400, msg: '无效的可见性值。' });
  }

  try {
    const creation = await Creation.findOneAndUpdate(
      { _id: id, user: userId },
      { is_public },
      { new: true } // 返回更新后的文档
    );

    if (!creation) {
      return res.status(404).json({ code: 404, msg: '历史记录未找到或无权修改', data: null });
    }
    res.json({ code: 0, msg: '可见性已更新', data: creation });
  } catch (error) {
    console.error('更新可见性失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;
