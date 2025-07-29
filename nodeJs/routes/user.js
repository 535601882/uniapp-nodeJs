const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 引入User模型

// 模拟任务数据 (暂时保留，后续可扩展为数据库存储)
const mockTasks = [
  { id: 'task_1', title: '每日签到', description: '每天获得5积分', credits: 5, completed: false }, // completed状态应从用户数据中获取
  { id: 'task_2', title: '首次分享', description: '首次分享您的作品', credits: 20, completed: false },
  { id: 'task_3', title: '创作10幅作品', description: '生成10张图片', credits: 50, completed: false },
];

/**
 * GET /api/user/profile
 * 获取用户资料信息。
 */
router.get('/profile', async (req, res) => {
  try {
    console.log('获取用户资料:', req.user);
    const user = await User.findById(req.user.id).select('-_id nickname avatar_url credits'); // 排除_id，只返回指定字段
    if (!user) {
      return res.status(404).json({ code: 404, msg: '用户未找到', data: null });
    }
    res.json({ code: 0, msg: '成功', data: user });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * POST /api/user/check-in
 * 每日签到。
 */
router.post('/check-in', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, msg: '用户未找到', data: null });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastCheckIn && user.lastCheckIn.getTime() >= today.getTime()) {
      return res.status(409).json({ code: 409, msg: '今日已签到。' });
    }

    const checkInCredits = 5;
    user.credits += checkInCredits;
    user.lastCheckIn = new Date();
    await user.save();

    // 更新模拟任务状态 (仅为前端展示，实际应有任务系统)
    const dailyCheckInTask = mockTasks.find(t => t.id === 'task_1');
    if (dailyCheckInTask) {
      dailyCheckInTask.completed = true;
    }

    res.json({ code: 0, msg: `签到成功，获得${checkInCredits}积分！`, data: { credits: checkInCredits } });
  } catch (error) {
    console.error('每日签到失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * GET /api/user/tasks
 * 获取任务列表。
 */
router.get('/tasks', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, msg: '用户未找到', data: null });
    }

    // 根据用户数据更新模拟任务的完成状态
    const tasksWithStatus = mockTasks.map(task => {
      let completed = task.completed; // 默认使用模拟的completed状态
      if (task.id === 'task_1') { // 每日签到任务
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        completed = user.lastCheckIn && user.lastCheckIn.getTime() >= today.getTime();
      }
      // 其他任务的完成状态需要更复杂的逻辑，这里暂时保持模拟状态
      return { ...task, completed };
    });

    res.json({ code: 0, msg: '成功', data: { tasks: tasksWithStatus } });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * POST /api/user/updateProfile
 * 更新用户资料（昵称和头像）。
 */
router.post('/updateProfile', async (req, res) => {
  const { nickname, avatar_url } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, msg: '用户未找到', data: null });
    }

    if (nickname) {
      user.nickname = nickname;
    }
    if (avatar_url) {
      user.avatar_url = avatar_url;
    }
    await user.save();

    res.json({ code: 0, msg: '用户资料更新成功', data: { nickname: user.nickname, avatar_url: user.avatar_url } });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;
