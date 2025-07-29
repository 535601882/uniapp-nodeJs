# openai-chat

## 项目简介

`openai-chat` 是一个基于 uni-app 的多端 AI 聊天与图片生成前端项目，支持与 OpenAI 接口对接，具备聊天、历史记录、AI 绘图等功能，界面简洁美观，适用于移动端和 Web。

## 主要功能

- AI 聊天对话
- 聊天历史记录查看
- AI 图片生成（支持多尺寸、多数量）
- 图片预览与保存
- 微信登录集成（如后端支持）

## 目录结构说明

```
openai-chat/
  ├── App.vue                # 应用入口
  ├── main.js                # 入口 JS，初始化配置
  ├── index.html             # H5 入口页面
  ├── components/            # 公共组件（如 ChatView、ImageGenView、HistoryDialog）
  ├── pages/                 # 页面目录
  │   └── index/             # 首页及主页面
  ├── static/                # 静态资源（图片等）
  ├── utils/                 # 工具函数
  ├── pages.json             # uni-app 页面配置
  ├── manifest.json          # uni-app 项目配置
  └── uni.scss               # 全局样式
```

## 安装与运行

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

在根目录下创建 `.env` 文件，配置后端 API 地址，例如：

```
VITE_BASE_URL=
```

3. 运行项目（以 H5 为例）：

```bash
npm run dev:h5
```

如需打包或运行到小程序/APP端，请参考 [uni-app 官方文档](https://uniapp.dcloud.net.cn/)。

## 依赖说明

- [uni-app](https://uniapp.dcloud.net.cn/) 生态
- Vue 3.x
- 需配合后端 API（如 `/api/chat`, `/api/image` 等）

## 常见问题

- **token 获取失败/未登录**：请确保已正确登录并获取到用户 token。
- **API 地址错误**：请检查 `VITE_BASE_URL` 是否配置为后端实际地址。
- **图片/聊天生成失败**：请检查后端服务是否正常，或查看控制台错误信息。

## 联系与反馈

如有问题或建议，欢迎提交 issue 或联系开发者。
