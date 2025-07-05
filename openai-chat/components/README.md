# ImageGenView.vue 组件说明

## 功能简介

`ImageGenView.vue` 是一个用于生成 AI 图片的前端组件，用户可以输入图片描述、选择生成数量和图片尺寸，并通过按钮触发图片生成，支持流式进度显示和图片预览。

## 主要属性与数据

- `prompt`：图片描述输入框的内容。
- `n`：生成图片的数量（1-10）。
- `size`：图片尺寸（支持 1024x1024、1536x1024、1024x1536）。
- `sizes`：可选尺寸列表。
- `loading`：生成过程中的加载状态。
- `images`：生成结果图片的数组。
- `progress`：进度条百分比。
- `statusText`：进度状态文本。

## 主要方法

- `genImageStream()`：发起图片生成请求，处理进度与结果。
- `onSliderChange(e)`：处理数量滑块变化。
- `onRadioChange(e)`：处理尺寸单选变化。
- `preview(img)`：预览生成的图片。

## 使用方法

1. 在页面中引入并注册该组件。
2. 配置好后端 API 地址（通过 `VITE_BASE_URL` 环境变量）。
3. 用户输入描述、选择数量和尺寸，点击"流式生成图片"按钮。
4. 生成结果会以图片列表形式展示，点击图片可预览大图。

```vue
<template>
  <ImageGenView />
</template>

<script setup>
import ImageGenView from './components/ImageGenView.vue'
</script>
```

## 依赖说明

- 依赖 `uni-app` 相关组件（如 `uni.request`, `uni.showToast`, `uni.previewImage` 等）。
- 依赖全局用户信息 `globalUser`（需包含 token）。
- 需后端 `/api/image` 接口支持，返回格式需包含 `download_links`。

## 注意事项

- 需确保用户已登录并有有效 token。
- 需配置好环境变量 `VITE_BASE_URL`。
- 组件样式基于 SCSS，需支持相应预处理器。 