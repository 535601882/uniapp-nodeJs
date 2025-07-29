# Node.js Express API 后端

本服务为小程序提供 GPT-4o 文本聊天、生图、历史对话、用户信息、token 等接口。

## 依赖安装

```bash
cd nodeJs
npm install
```

## 环境变量

请复制 `.env.example` 为 `.env` 并填写你的 API KEY：

```
OPENAI_API_KEY=你的API密钥
OPENAI_BASE_URL=
OPENAI_MODEL=gpt-4o-all
PORT=3000
```

## 启动服务

```bash
npm start
# 或开发模式
npm run dev
```

## 接口文档

### 1. 文本聊天
- 路径：`POST /api/chat`
- 参数：`{ openid, messages }`（messages为OpenAI格式数组）
- 返回：`{ code, msg, data: { reply } }`

### 2. 生图
- 路径：`POST /api/image`
- 参数：`{ prompt, n, size }`
- 返回：`{ code, msg, data: { images } }`

### 3. 历史对话
- 路径：`GET /api/history/:openid`
- 返回：`{ code, msg, data: { history } }`

### 4. 获取用户信息
- 路径：`GET /api/user/:openid`
- 返回：`{ code, msg, data: user }`

### 5. 刷新token
- 路径：`POST /api/token/refresh`
- 返回：`{ code, msg, data: { token } }`

### 6. 余额查询
- 路径：`GET /api/balance`
- 返回：`{ code, msg, data: { total_limit, total_usage, remaining } }`

## 返回格式示例

```json
{
  "code": 0,
  "msg": "ok",
  "data": { /* 具体数据 */ }
}
```

## 常见错误码
| code | HTTP状态 | 含义 |
|------|----------|------|
| 0    | 200      | 成功 |
| 400  | 400      | 参数错误 |
| 404  | 404      | 接口不存在 |
| 500  | 500      | 服务器内部错误/AI服务异常 |

## 示例请求

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"openid":"test","messages":[{"role":"user","content":"你好"}]}'
```

## 项目结构

```
nodeJs/
  |-- index.js           # 主入口
  |-- package.json       # 依赖说明
  |-- .env.example       # 环境变量模板
  |-- README.md          # 项目说明
  |-- routes/            # 路由目录
      |-- chat.js        # 文本聊天接口
      |-- image.js       # 生图接口
      |-- history.js     # 历史对话接口
      |-- user.js        # 用户信息接口
      |-- token.js       # token接口
      |-- balance.js     # 余额查询接口
  |-- utils/             # 工具函数
      |-- historyStore.js# 历史对话内存存储
      |-- image2Base64.js# 图片转base64
```

## 开发与安全建议
- 请勿将真实API密钥上传到代码仓库
- 建议使用.env文件管理敏感信息
- 本项目为演示/开发用途，生产环境请接入数据库持久化历史
- 如需扩展接口，请在routes和utils目录下添加

## 前后端联调说明
- 前端请求统一以 `/api/` 开头，自动路由到对应接口
- 返回格式和错误码请参考上文，便于前端统一处理
- 如需跨域，已默认支持CORS



如需前端uniApp代码，请查看uniApp目录。
