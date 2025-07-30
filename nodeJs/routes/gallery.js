const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Creation = require('../models/Creation'); // 引入Creation模型
const User = require('../models/User'); // 引入User模型

/**
 * GET /api/gallery/public
 * 获取公共画廊作品，支持分页。
 * 查询参数: ?page=1&limit=10&sort=newest|hottest
 */
router.get('/public', async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  const userId = req.user ? req.user.id : null; // 当前用户ID，用于判断是否已点赞

  try {
    let query = { is_public: true };
    let sortOptions = {};

    if (sort === 'hottest') {
      // For 'hottest', we sort by the size of the likedBy array
      sortOptions = { 'likedBy.length': -1, createdAt: -1 };
    } else { // newest
      sortOptions = { createdAt: -1 };
    }

    const creations = await Creation.find(query)
      .populate('user', 'nickname avatar_url') // 关联查询用户信息
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Creation.countDocuments(query);

    const itemsWithLikeStatus = creations.map(item => {
      const isLiked = userId ? item.likedBy.includes(userId) : false;
      return {
        ...item.toObject(),
        author_name: item.user ? item.user.nickname : '未知用户',
        author_avatar: item.user ? item.user.avatar_url : 'https://i.pravatar.cc/40',
        is_liked: isLiked,
        likes: item.likedBy.length, // Use the length of likedBy array for likes count
      };
    });

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
 * GET /api/gallery/:id
 * 获取单个画廊作品详情。
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null; // 当前用户ID

  try {
    const creation = await Creation.findById(id).populate('user', 'nickname avatar_url');
    if (!creation || !creation.is_public) {
      return res.status(404).json({ code: 404, msg: '作品未找到或不是公开作品', data: null });
    }

    const isLiked = userId ? creation.likedBy.includes(userId) : false;

    res.json({
      code: 0,
      msg: '成功',
      data: {
        ...creation.toObject(),
        author_name: creation.user ? creation.user.nickname : '未知用户',
        author_avatar: creation.user ? creation.user.avatar_url : 'https://i.pravatar.cc/40',
        is_liked: isLiked,
        likes: creation.likedBy.length,
      }
    });
  } catch (error) {
    console.error('获取作品详情失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * POST /api/gallery/like/:id
 * 点赞或取消点赞作品。
 */
router.post('/like/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null; // 从JWT中获取用户ID

  if (!userId) {
    return res.status(401).json({ code: 401, msg: '未授权', data: null });
  }

  try {
    const creation = await Creation.findById(id);
    if (!creation) {
      return res.status(404).json({ code: 404, msg: '作品未找到', data: null });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId

    const isLiked = creation.likedBy.includes(userObjectId);

    if (isLiked) {
      // If already liked, unlike it
      creation.likedBy = creation.likedBy.filter(uid => !uid.equals(userObjectId));
    } else {
      // If not liked, like it
      creation.likedBy.push(userObjectId);
    }
    await creation.save();

    res.json({ code: 0, msg: '成功', data: { id: creation._id, is_liked: !isLiked, likes: creation.likedBy.length } });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;
