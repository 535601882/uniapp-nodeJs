const axios = require('axios');
require('dotenv').config(); // 加载 .env 文件中的环境变量

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

// 创建一个 Axios 实例，配置通用请求头和 baseURL
const openaiClient = axios.create({
  baseURL: OPENAI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});

const openai = {
  images: {
    /**
     * 调用 OpenAI DALL-E API 生成图片
     * @param {object} options - 生成图片的选项
     * @param {string} options.prompt - 提示词
     * @param {number} [options.n=1] - 生成图片的数量
     * @param {string} [options.size='1024x1024'] - 图片尺寸
     * @param {string} [options.model='dall-e-3'] - 模型名称
     * @returns {Promise<object>} - 包含图片URL的数据对象
     */
    generate: async ({ prompt, n = 1, size = '1024x1024', model = 'dall-e-3' }) => {
      try {
        const response = await openaiClient.post('/images/generations', {
          prompt,
          n,
          size,
          model,
        });
        // 确保返回的数据结构与 OpenAI 官方库一致，方便路由文件使用
        return response.data; // response.data 应该包含 { data: [{ url: '...' }] }
      } catch (error) {
        console.error('OpenAI image generation error:', error.response ? error.response.data : error.message);
        throw new Error(error.response ? error.response.data.error.message : 'OpenAI API request failed');
      }
    },
  },
  chat: {
    completions: {
      /**
       * 调用 OpenAI Chat Completions API 进行聊天
       * @param {object} options - 聊天选项
       * @param {Array<object>} options.messages - 消息数组
       * @param {string} options.model - 模型名称
       * @returns {Promise<object>} - 包含聊天回复的数据对象
       */
      create: async ({ messages, model }) => {
        try {
          console.log('Messages:', messages);
          const response = await openaiClient.post('/chat/completions', {
            messages,
            model,
          });
          console.log('Response:', response.data);
          // 确保返回的数据结构与 OpenAI 官方库一致
          return response.data; // response.data 应该包含 { choices: [{ message: { content: '...' } }] }
        } catch (error) {
          console.error('OpenAI chat completion error:', error.response ? error.response.data : error.message);
          throw new Error(error.response ? error.response.data.error.message : 'OpenAI API request failed');
        }
      },
    },
  },
};

module.exports = openai;
