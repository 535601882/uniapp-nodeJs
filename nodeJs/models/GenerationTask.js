const mongoose = require('mongoose');

const GenerationTaskSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],//添加新的状态
      default: 'pending',
    },
    imageUrl: {
      type: String,
      default: null, // 生成成功后的图片URL
    },
    error: {
      type: String,
      default: null, // 生成失败时的错误信息
    },
    n: { type: Number, default: 1 },
    size: { type: String, default: '1024x1024' },
    inputImageBase64: { type: String, default: null },// 输入图片的base64编码
    model: { type: String, default: '' },
    openaiResponse: { type: mongoose.Schema.Types.Mixed, default: null }, // 新增字段，保存OpenAI的原始响应
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
  }
);

module.exports = mongoose.model('GenerationTask', GenerationTaskSchema);
