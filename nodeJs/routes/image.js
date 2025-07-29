const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const User = require('../models/User'); // 引入User模型
const Creation = require('../models/Creation'); // 引入Creation模型
const CreditRecord = require('../models/CreditRecord'); // 引入CreditRecord模型

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// POST /api/image
router.post('/', async (req, res) => {
  const { prompt, images = [], model = 'gpt-4o-image', n = 1, size = '1024x1024' } = req.body;
  const userId = req.user.id; // 从JWT中获取用户ID

  if (!prompt && (!images || images.length === 0)) {
    return res.status(400).json({ code: 400, msg: '缺少prompt或图片', data: null });
  }
  if (images.length > 10) {
    return res.status(400).json({ code: 400, msg: '图片数量不能超过10张', data: null });
  }

  try {
    const user = await User.findById(userId); // 从数据库获取用户
    if (!user) {
      return res.status(404).json({ code: 404, msg: '用户未找到', data: null });
    }

    const cost = 1; // 每次生成图片消耗1积分
    if (user.credits < cost) {
      return res.status(402).json({ code: 402, msg: '积分不足，请充值', data: null });
    }

    // 扣除积分
    user.credits -= cost;
    await user.save();

    // 记录积分消耗
    await CreditRecord.create({
      user: userId,
      type: 'consume',
      description: '图片生成消耗',
      amount: -cost,
    });

    let messages = [];
    let promptWithParams = prompt;
    if (size) {
      promptWithParams += `，图片尺寸：${size}`;
    }
    if (n) {
      promptWithParams += `，图片数量：${n}`;
    }
    // 判断是否有图片
    if (images.length > 0) {
      // 只取第一张图片，按API示例格式
      let image_url = images.map(item => ({ type: 'image_url', image_url: { url: item } }));
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: promptWithParams },
          ...image_url
        ]
      });
    } else {
      // 纯文本
      messages.push({ role: 'user', content: promptWithParams });
    }
    const params = {
      max_tokens: 1024,
      model: model,
      temperature: 0.8,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      messages,
      stream: false
    };
    const response = await axios.post(process.env.OPENAI_BASE_URL+'/chat/completions', params, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      timeout: 540000
    });
    // 提取“点击下载”链接
    const downloadMatch = response.data.choices?.[0]?.message?.content?.match(/\[点击下载\]\((https?:\/\/[^\s)]+\.png)\)/i);
    const download_links = downloadMatch || [];

    // 保存创作记录到数据库
    if (download_links.length > 0) {
      await Creation.create({
        user: userId,
        prompt: prompt,
        image_url: download_links[0],
        is_public: false, // 默认不公开
      });
    }

    res.json({ code: 0, msg: '成功', data: { ...response.data, download_links } });
    return;
  } catch (err) {
    console.error('生图服务异常:', err.response?.data || err.message);
    // 如果是积分不足的错误，返回402
    if (err.response?.status === 402) {
      return res.status(402).json({ code: 402, msg: err.response.data.msg, data: null });
    }
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: err.message });
  }
});

// POST /api/upload
router.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ code: 400, msg: '未检测到图片文件', data: null });
    }
    const file = req.files.image;
    // 将 Buffer 转为 base64
    const base64 = file.data.toString('base64');
    const formData = new FormData();
    formData.append('key', process.env.IMGBB_API_KEY);
    formData.append('image', base64); // 直接传 base64
    const imgbbRes = await axios.post(process.env.IMGBB_HOST, formData, {
      headers: formData.getHeaders(),
      timeout: 600000 
    });
    // console.log("imgbbRes",imgbbRes)
    if (imgbbRes.data && imgbbRes.data.success && imgbbRes.data.data && imgbbRes.data.data.url) {
      const imageUrl = imgbbRes.data.data.display_url || imgbbRes.data.data.url;
      res.json({ code: 0, msg: '成功', data: { url: imageUrl } });
    } else {
      res.status(500).json({ code: 500, msg: 'imgbb上传失败', data: imgbbRes.data });
    }
  } catch (err) {
    res.status(500).json({ code: 500, msg: '上传服务异常', data: err.message });
  }
});

module.exports = router;