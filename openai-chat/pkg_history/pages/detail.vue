<template>
  <view v-if="item" class="detail-page">
    <image :src="item.image_url" class="detail-image" mode="widthFix" />
    <view class="info-card">
      <text class="prompt-title">提示词</text>
      <text class="prompt-text">{{ item.prompt }}</text>
      <view class="metadata">
        <text>创建时间: {{ new Date(item.createdAt).toLocaleString() }}</text>
      </view>
    </view>
    <view class="actions-card">
      <view class="action-item">
        <text>设为公开</text>
        <switch :checked="item.is_public" @change="toggleVisibility" />
      </view>
      <button class="delete-button" @click="deleteItem">删除创作</button>
    </view>
  </view>
  <view v-else-if="loading" class="loading-indicator">加载详情中...</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // In uni-app, you get this from onLoad options
import { historyApi } from '@/utils/api';

const item = ref(null);
const loading = ref(true);
let itemId = null;

const fetchDetail = async () => {
  if (!itemId) return;
  loading.value = true;
  try {
    item.value = await historyApi.getDetail(itemId);
  } catch (error) {
    console.error('获取详情失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const toggleVisibility = async (e) => {
  const newVisibility = e.detail.value;
  try {
    await historyApi.updateVisibility(itemId, newVisibility);
    item.value.is_public = newVisibility;
    uni.showToast({ title: `已设置为${newVisibility ? '公开' : '私密'}`, icon: 'success' });
  } catch (error) {
    uni.showToast({ title: '更新失败', icon: 'none' });
    // Revert the switch state on failure
    item.value.is_public = !newVisibility;
  }
};

const deleteItem = async () => {
  uni.showModal({
    title: '确认',
    content: '您确定要永久删除此创作吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await historyApi.delete(itemId);
          uni.showToast({ title: '已删除', icon: 'success' });
          uni.navigateBack();
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    }
  });
};

// In uni-app, you get route params from the onLoad lifecycle hook
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  itemId = currentPage.options.id;
  fetchDetail();
});
</script>

<style scoped lang="scss">
.detail-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 20rpx;
}
.detail-image {
  width: 100%;
  border-radius: 24rpx;
  background-color: #1F2937;
}
.info-card, .actions-card {
  background-color: #1F2937;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  color: #E5E7EB;
}
.prompt-title {
  font-size: 28rpx;
  color: #9CA3AF;
  display: block;
}
.prompt-text {
  font-size: 32rpx;
  margin-top: 10rpx;
  display: block;
}
.metadata {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #6B7280;
}
.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 30rpx;
}
.delete-button {
  margin-top: 30rpx;
  background-color: #4B1515; // Dark red
  color: #EF4444;
  border: 1px solid #EF4444;
  font-size: 30rpx;
}
.loading-indicator {
  text-align: center;
  color: #6B7280;
  padding-top: 100rpx;
}
</style>
