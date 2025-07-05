const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/balance
router.get('/', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  try {
    // 总额度
    const subUrl = `${process.env.OPENAI_BASE_URL}/dashboard/billing/subscription`;
    const subRes = await axios.get(subUrl, { headers });
    const total_limit = subRes.data.hard_limit_usd || 0;
    // 已用额度
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const usageUrl = `${process.env.OPENAI_BASE_URL}/dashboard/billing/usage?start_date=${startStr}&end_date=${endStr}`;
    const usageRes = await axios.get(usageUrl, { headers });
    const total_usage = (usageRes.data.total_usage || 0) / 100;
    const remaining = total_limit - total_usage;
    res.json({ code: 0, msg: 'ok', data: { total_limit, total_usage, remaining } });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '查询失败', data: err.message });
  }
});

module.exports = router; 