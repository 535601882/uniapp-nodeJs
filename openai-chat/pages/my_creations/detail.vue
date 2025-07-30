<template>
  <view class="creation-detail-page">
    <view v-if="task" class="detail-card">
      <view class="status-section">
        <text class="status-label">状态:</text>
        <text class="status-text" :class="task.status">{{ getStatusText(task.status) }}</text>
      </view>

      <view class="image-section">
        <image v-if="task.status === 'completed' && task.imageUrl" :src="task.imageUrl" mode="widthFix" class="generated-image" />
        <view v-else class="image-placeholder">
          <text v-if="task.status === 'pending' || task.status === 'processing'">图片生成中，请稍候...</text>
          <text v-else-if="task.status === 'failed'">图片生成失败</text>
        </view>
      </view>

      <view class="prompt-section">
        <text class="prompt-label">提示词:</text>
        <text class="prompt-text">{{ task.prompt }}</text>
      </view>

      <view v-if="task.status === 'failed' && task.error" class="error-section">
        <text class="error-label">错误信息:</text>
        <text class="error-text">{{ task.error }}</text>
      </view>

      <view class="time-section">
        <text>提交时间: {{ new Date(task.createdAt).toLocaleString() }}</text>
        <text v-if="task.updatedAt">更新时间: {{ new Date(task.updatedAt).toLocaleString() }}</text>
      </view>

      <button v-if="task.status === 'completed' && task.imageUrl" class="save-button" @click="saveImage">保存图片</button>
    </view>
    <view v-else class="loading-indicator">加载中...</view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad,onHide,onUnload } from '@dcloudio/uni-app';
import { imageApi } from '@/utils/api';

const task = ref(null);
const taskId = ref(null);
let pollingInterval = null;

onLoad((options) => {
  taskId.value = options.id;
  fetchTaskDetail();
});

const fetchTaskDetail = async () => {
  if (!taskId.value) return;
  try {
    const data = await imageApi.getGenerationTaskDetail(taskId.value);
    task.value = data;
    if (data.status === 'pending' || data.status === 'processing') {
      startPolling(); // 如果任务还在进行中，开始轮询
    } else {
      stopPolling();
    }
  } catch (error) {
    console.error('获取任务详情失败:', error);
    uni.showToast({
      title: '获取详情失败',
      icon: 'error',
    });
  }
};

const getStatusText = (status) => {
  const statusMap = {
    pending: '等待中',
    processing: '生成中',
    completed: '已完成',
    failed: '已失败',
  };
  return statusMap[status] || status;
};


const saveImage = () => {
  if (!task.value || !task.value.imageUrl) {
    uni.showToast({
      title: '图片地址无效',
      icon: 'none',
    });
    return;
  }
  uni.downloadFile({
    url: task.value.imageUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.showToast({
              title: '保存成功',
              icon: 'success',
            });
          },
          fail: () => {
            uni.showToast({
              title: '保存失败',
              icon: 'error',
            });
          },
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '下载失败',
        icon: 'error',
      });
    },
  });
};

const startPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    await fetchTaskDetail(); // 重新获取当前任务的最新状态
  }, 3000); // 每3秒轮询一次
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

onHide(() => {
  console.log('onHide')
  stopPolling();
});

onUnload(() => {
  console.log('onUnload')
  stopPolling();
});
</script>

<style scoped lang="scss">
.creation-detail-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 20rpx;
  color: #E5E7EB;
}
.detail-card {
  background-color: #1F2937;
  border-radius: 16rpx;
  padding: 30rpx;
}
.status-section {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}
.status-label {
  font-size: 30rpx;
  color: #9CA3AF;
  margin-right: 20rpx;
}
.status-text {
  font-size: 32rpx;
  font-weight: bold;
  &.pending { color: #F59E0B; }
  &.processing { color: #3B82F6; }
  &.completed { color: #10B981; }
  &.failed { color: #EF4444; }
}
.image-section {
  margin-bottom: 30rpx;
  text-align: center;
}
.generated-image {
  width: 100%;
  border-radius: 16rpx;
}
.image-placeholder {
  width: 100%;
  height: 400rpx; /* 占位高度 */
  background-color: #374151;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9CA3AF;
  font-size: 32rpx;
}
.prompt-section {
  margin-bottom: 30rpx;
}
.prompt-label {
  font-size: 28rpx;
  color: #9CA3AF;
  margin-bottom: 10rpx;
  display: block;
}
.prompt-text {
  font-size: 30rpx;
  line-height: 1.6;
}
.error-section {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #2D1A1A;
  border-left: 4px solid #EF4444;
  border-radius: 8rpx;
}
.error-label {
  font-size: 28rpx;
  color: #EF4444;
  margin-bottom: 10rpx;
  display: block;
}
.error-text {
  font-size: 28rpx;
  color: #FCA5A5;
}
.time-section {
  font-size: 26rpx;
  color: #9CA3AF;
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.save-button {
  background-color: #4F46E5;
  color: #FFFFFF;
  font-size: 30rpx;
  padding: 20rpx 0;
  border-radius: 10rpx;
  margin-top: 40rpx;
  width: 100%;
  border: none;
  outline: none;
}
.loading-indicator {
  text-align: center;
  color: #9CA3AF;
  margin-top: 100rpx;
}
</style>
