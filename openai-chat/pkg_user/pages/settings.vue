<template>
  <view class="settings-page">
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pkg_user/pages/agreement')">
        <text>用户协议</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pkg_user/pages/privacy')">
        <text>隐私政策</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="clearCache">
        <text>清除缓存</text>
        <text class="cache-size">{{ cacheSize }}</text>
      </view>
    </view>
    <view class="app-info">
      <text>版本 1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const cacheSize = ref('0 KB');

const getCacheSize = () => {
  // 在实际应用中，您可能会更准确地计算它。
  // 目前，它是一个模拟值。
  const randomSize = (Math.random() * 500).toFixed(2);
  cacheSize.value = `${randomSize} KB`;
};

const clearCache = () => {
  uni.showModal({
    title: '确认',
    content: '您确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '清除中...' });
        setTimeout(() => {
          cacheSize.value = '0 KB';
          uni.hideLoading();
          uni.showToast({ title: '缓存已清除', icon: 'success' });
        }, 1000);
      }
    }
  });
};

const navigateTo = (url) => {
  uni.navigateTo({ url });
};

onMounted(() => {
  getCacheSize();
});
</script>

<style scoped lang="scss">
.settings-page {
  background-color: #111827;
  min-height: 100vh;
  padding-top: 30rpx;
}
.menu-list {
  margin: 0 30rpx;
  background-color: #1F2937;
  border-radius: 16rpx;
  overflow: hidden;
  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #374151;
    color: #E5E7EB;
    font-size: 30rpx;
    &:last-child {
      border-bottom: none;
    }
    text {
      flex: 1;
    }
    .arrow, .cache-size {
      flex: 0 0 auto;
      color: #6B7280;
    }
  }
}
.app-info {
  text-align: center;
  color: #6B7280;
  font-size: 24rpx;
  position: absolute;
  bottom: 50rpx;
  left: 0;
  right: 0;
}
</style>