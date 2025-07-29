<template>
  <view class="feedback-page">
    <view class="form-card">
      <textarea
        v-model="content"
        class="feedback-textarea"
        placeholder="您的反馈对我们很重要..."
        maxlength="500"
      />
      <input
        v-model="contact"
        class="contact-input"
        placeholder="联系方式 (可选，例如：邮箱或电话)"
        style="height: 80rpx;"
      />
    </view>
    <button class="submit-button" @click="submitFeedback" :loading="loading">提交</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { commonApi } from '@/utils/api';

const content = ref('');
const contact = ref('');
const loading = ref(false);

const submitFeedback = async () => {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入您的反馈内容', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    const res = await commonApi.submitFeedback({ content: content.value, contact: contact.value });
    uni.showToast({ title: res.msg, icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);
  } catch (error) {
    uni.showToast({ title: error.msg || '提交失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.feedback-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 30rpx;
}
.form-card {
  background-color: #1F2937;
  border-radius: 16rpx;
  padding: 30rpx;
}
.feedback-textarea {
  width: 100%;
  height: 300rpx;
  background-color: #374151;
  color: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}
.contact-input {
  width: 100%;
  margin-top: 20rpx;
  background-color: #374151;
  color: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}
.submit-button {
  margin-top: 40rpx;
  background: linear-gradient(to right, #4F46E5, #7C3AED);
  color: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 0;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
