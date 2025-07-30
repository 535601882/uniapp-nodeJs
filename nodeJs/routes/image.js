const express = require('express');
const router = express.Router();
const openai = require('../utils/openai');
const GenerationTask = require('../models/GenerationTask');
const Creation = require('../models/Creation');
const { image2Base64 } = require('../utils/image2Base64'); // 引入图片转Base64工具

// 异步处理函数，模拟后台任务
const processGenerationTask = async (taskId) => {
  try {
    const task = await GenerationTask.findById(taskId);
    if (!task) {
      console.error(`Task ${taskId} not found for processing.`);
      return;
    }

    task.status = 'processing';
    await task.save();

    let messages = [];

    if (task.inputImageBase64) {
      // 如果有输入图片，构建多模态消息
      messages.push({
        role: "user",
        content: [
          { type: "text", text: task.prompt },
          { type: "image_url", image_url: { url: task.inputImageBase64 } }
        ]
      });
    } else {
      // 否则，只包含文本提示词
      messages.push({ role: "user", content: task.prompt });
    }

    // 调用OpenAI Chat Completions API 进行图片生成
    const chatResponse = await openai.chat.completions.create({
      model: task.model, // 使用任务中保存的模型
      messages: messages,
    });

    console.log('OpenAI chatResponse:', JSON.stringify(chatResponse, null, 2)); // 添加这行日志

    const chatContent = chatResponse.choices[0].message.content;
    // 使用正则表达式从 Markdown 链接中提取 URL
    const urlMatch = chatContent.match(/\(https?:\/\/[^)]+\)/);
    let imageUrl = null;
    if (urlMatch && urlMatch[0]) {
      imageUrl = urlMatch[0].substring(1, urlMatch[0].length - 1); // 移除括号
    } else {
      // 如果没有匹配到 Markdown 链接，尝试直接使用内容作为 URL (备用)
      imageUrl = chatContent;
    }

    task.status = 'completed';
    task.imageUrl = imageUrl;
    task.openaiResponse = chatResponse; // 保存完整的OpenAI响应
    await task.save();

    // 任务完成后，也可以选择将图片保存到 Creation 模型中，作为用户的作品
    await Creation.create({
      user: task.userId,
      prompt: task.prompt,
      image_url: imageUrl,
      is_public: false, // 默认私有，用户可选择公开
    });

    console.log(`Task ${taskId} completed. Image URL: ${imageUrl}`);
  } catch (error) {
    console.error(`Error processing task ${taskId}:`, error);
    const task = await GenerationTask.findById(taskId);
    if (task) {
      task.status = 'failed';
      task.error = error.message || 'Unknown error';
      await task.save();
    }
  }
};

/**
 * POST /api/image
 * 提交图片生成任务
 */
router.post('/', async (req, res) => {
  const { prompt, n = 1, size = '1024x1024', model = 'gpt-image-1' } = req.body; // 从请求体中获取model，默认值为gpt-image-1
  const userId = req.user.id; // 从JWT获取用户ID
  let inputImageBase64 = null;

  // 检查是否有文件上传
  if (req.files && req.files.image) {
    const inputImage = req.files.image;
    // 将图片数据转换为Base64编码
    // 注意：req.files.image.data 是一个 Buffer
    inputImageBase64 = `data:${inputImage.mimetype};base64,${inputImage.data.toString('base64')}`;
  }

  if (!prompt && !inputImageBase64) {
    return res.status(400).json({ code: 400, msg: '缺少提示词或图片', data: null });
  }

  try {
    // 创建任务记录
    const newTask = await GenerationTask.create({
      userId,
      prompt,
      n,
      size,
      inputImageBase64, // 保存Base64编码的图片数据
      model, // 保存模型名称
      status: 'pending',
    });

    // 异步处理任务
    setTimeout(() => processGenerationTask(newTask._id), 0); // 立即异步执行

    res.json({
      code: 0,
      msg: '图片生成任务已提交',
      data: { taskId: newTask._id, status: newTask.status },
    });
  } catch (error) {
    console.error('提交图片生成任务失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * GET /api/image/tasks
 * 获取当前用户的图片生成任务列表
 * Query: status (optional), page, limit
 */
router.get('/tasks', async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  let query = { userId };
  if (status) {
    query.status = status;
  }

  try {
    const tasks = await GenerationTask.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await GenerationTask.countDocuments(query);

    res.json({
      code: 0,
      msg: '成功',
      data: {
        items: tasks,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

/**
 * GET /api/image/tasks/:taskId
 * 获取单个图片生成任务详情
 */
router.get('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await GenerationTask.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ code: 404, msg: '任务未找到或无权限', data: null });
    }
    res.json({ code: 0, msg: '成功', data: task });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
});

module.exports = router;