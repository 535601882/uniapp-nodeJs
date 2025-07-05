const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// POST /api/image
router.post('/', async (req, res) => {
  const { prompt, images = [], model = 'gpt-4o-image', n = 1, size = '1024x1024' } = req.body;
  if (!prompt && (!images || images.length === 0)) {
    return res.status(400).json({ code: 400, msg: '缺少prompt或图片', data: null });
  }
  if (images.length > 10) {
    return res.status(400).json({ code: 400, msg: '图片数量不能超过10张', data: null });
  }
  try {
    // 构建消息内容
    const message_content = [{ type: 'text', text: prompt }];
    for (const img of images) {
      message_content.push({
        type: 'image_url',
        image_url: { url: img }
      });
    }
    const data = {
      model,
      stream: false,
      messages: [
        {
          role: 'user',
          content: message_content
        }
      ]
    };
    console.log("data",data)
    const completion = await openai.chat.completions.create(data, {
      timeout: 600000 // 10分钟，防止生图超时
    });
    console.log("completion",completion)
    // 提取图片下载链接
    let download_links = [];
    if (
      completion.choices &&
      Array.isArray(completion.choices)
    ) {
      const re = /\[点击下载\]\((https?:\/\/[^\s\)]+)\)/g;
      for (const choice of completion.choices) {
        if (choice.message && choice.message.content) {
          let match;
          while ((match = re.exec(choice.message.content)) !== null) {
            download_links.push(match[1]);
          }
        }
      }
    }
    res.json({ code: 0, msg: 'ok', data: { download_links, raw: completion } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '生图服务异常', data: err.message });
  }
});

module.exports = router; 