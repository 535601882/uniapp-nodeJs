const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { saveHistory } = require('../utils/historyStore');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

//保留最近 3 轮完整对话
function getContextMessages(messages, maxTurns = 3) {
  // messages: [{role, content}, ...]
  // 保留 system prompt
  const systemMsg = messages.find(m => m.role === 'system');
  // 只保留最近 maxTurns 轮 user+assistant
  const dialog = messages.filter(m => m.role !== 'system');
  const keep = dialog.slice(-maxTurns * 2);
  return systemMsg ? [systemMsg, ...keep] : keep;
}

// POST /api/chat
router.post('/', async (req, res) => {
  console.log("req.body",req.body)
  const { openid, messages,model='gpt-4o' } = req.body;
  if (!openid || !Array.isArray(messages)) {
    return res.status(400).json({ code: 400, msg: '参数错误', data: null });
  }
  try {
    const contextMessages = getContextMessages(messages);
    const completion = await openai.chat.completions.create({
      model: model,
      messages: contextMessages,
    });
    const reply = completion.choices[0].message.content;
    saveHistory(openid, messages, reply);
    res.json({ code: 0, msg: 'ok', data: { reply } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: 'AI服务异常', data: err.message });
  }
});

module.exports = router; 