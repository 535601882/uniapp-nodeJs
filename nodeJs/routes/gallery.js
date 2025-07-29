const express = require('express');
const router = express.Router();
const Creation = require('../models/Creation'); // 引入Creation模型
const User = require('../models/User'); // 引入User模型

/**
 * GET /api/gallery/public
 * 获取公共画廊作品，支持分页。
 * 查询参数: ?page=1&limit=10&sort=newest|hottest
 */
router.get('/public', async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  const userId = req.user.id; // 当前用户ID，用于判断是否已点赞

  try {
    let query = { is_public: true };
    let sortOptions = {};

    if (sort === 'hottest') {
      sortOptions = { likes: -1, createdAt: -1 };
    } else { // newest
      sortOptions = { createdAt: -1 };
    }

    const creations = await Creation.find(query)
      .populate('user', 'nickname avatar_url') // 关联查询用户信息
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Creation.countDocuments(query);

    // 模拟点赞状态 (实际需要一个liked_by数组来判断)
    const itemsWithLikeStatus = creations.map(item => ({
      ...item.toObject(),
      author_name: item.user ? item.user.nickname : '未知用户',
      author_avatar: item.user ? item.user.avatar_url : 'https://i.pravatar.cc/40',
      is_liked: false, // 暂时模拟为false，实际需要判断当前用户是否在item.liked_by中
    }));

    res.json({
      code: 0,
      msg: '成功',
      data: {
        items: itemsWithLikeStatus,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    console.error('获取公共画廊失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * POST /api/gallery/like/:id
 * 点赞或取消点赞作品。
 */
router.post('/like/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 从JWT中获取用户ID

  try {
    const creation = await Creation.findById(id);
    if (!creation) {
      return res.status(404).json({ code: 404, msg: '作品未找到', data: null });
    }

    // 模拟点赞逻辑：每次调用都切换点赞状态并增减likes
    // 实际应用中，需要维护一个liked_by数组，防止重复点赞/取消点赞
    const isLiked = false; // 假设当前用户未点赞
    if (!isLiked) {
      creation.likes += 1;
      // creation.liked_by.push(userId); // 实际应用中
    } else {
      creation.likes -= 1;
      // creation.liked_by = creation.liked_by.filter(uid => uid.toString() !== userId.toString()); // 实际应用中
    }
    await creation.save();

    res.json({ code: 0, msg: '成功', data: { id: creation._id, is_liked: !isLiked, likes: creation.likes } });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;