<template>
  <view class="my-creations-page">
    <scroll-view scroll-y class="task-list-scroll" @scrolltolower="loadMore">
      <view v-for="task in tasks" :key="task._id" class="task-item" @click="goToDetail(task)">
        <view class="task-header">
          <text class="task-status" :class="task.status">{{ getStatusText(task.status) }}</text>
          <text class="task-time">{{ new Date(task.createdAt).toLocaleString() }}</text>
        </view>
        <view class="task-content">
          <image v-if="task.status === 'completed' && task.imageUrl" :src="task.imageUrl" mode="aspectFill" class="task-image" />
          <view v-else class="task-placeholder">
            <text v-if="task.status === 'pending' || task.status === 'processing'">生成中...</text>
            <text v-else-if="task.status === 'failed'">生成失败</text>
          </view>
          <text class="task-prompt">{{ task.prompt }}</text>
        </view>
        <text v-if="task.status === 'failed' && task.error" class="task-error">错误: {{ task.error }}</text>
      </view>
      <view v-if="loading" class="loading-indicator">加载中...</view>
      <view v-if="!hasMore" class="end-indicator">- 到底了 -</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onHide } from '@dcloudio/uni-app'
import { imageApi } from '@/utils/api';

const tasks = ref([]);
const page = ref(1);
const limit = ref(10);
const hasMore = ref(true);
const loading = ref(false);
let pollingInterval = null;

const fetchTasks = async (reset = false) => {
  if (loading.value || (!reset && !hasMore.value)) return;
  loading.value = true;

  if (reset) {
    page.value = 1;
    tasks.value = [];
    hasMore.value = true;
  }

  try {
    const data = await imageApi.getGenerationTasks({ page: page.value, limit: limit.value });
    tasks.value = [...tasks.value, ...data.items];
    if (tasks.value.length >= data.total) {
      hasMore.value = false;
    }
    page.value++;
  } catch (error) {
    console.error('获取生成任务失败:', error);
  } finally {
    loading.value = false;
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

const goToDetail = (task) => {
  uni.navigateTo({
    url: `/pages/my_creations/detail?id=${task._id}`,
  });
};

const startPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    const pendingTasks = tasks.value.filter(t => t.status === 'pending' || t.status === 'processing');
    if (pendingTasks.length === 0 && !hasMore.value) {
      clearInterval(pollingInterval); // 没有待处理任务且没有更多数据时停止轮询
      return;
    }
    // 重新获取所有任务，或者只获取待处理任务的最新状态
    await fetchTasks(true); // 简单粗暴，重新获取所有任务
  }, 5000); // 每5秒轮询一次
};

onMounted(() => {
  fetchTasks(true);
  startPolling();
});

onHide(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<style scoped lang="scss">
.my-creations-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 20rpx;
}
.task-list-scroll {
  height: calc(100vh - 40rpx); // 减去padding
}
.task-item {
  background-color: #1F2937;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  color: #E5E7EB;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.task-status {
  font-weight: bold;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  &.pending { background-color: #F59E0B; color: #FFF; }
  &.processing { background-color: #3B82F6; color: #FFF; }
  &.completed { background-color: #10B981; color: #FFF; }
  &.failed { background-color: #EF4444; color: #FFF; }
}
.task-time {
  font-size: 24rpx;
  color: #9CA3AF;
}
.task-content {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.task-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  background-color: #374151;
}
.task-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  background-color: #374151;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9CA3AF;
  font-size: 28rpx;
}
.task-prompt {
  flex: 1;
  font-size: 28rpx;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-error {
  color: #EF4444;
  font-size: 26rpx;
  margin-top: 10rpx;
}
.loading-indicator, .end-indicator {
  text-align: center;
  color: #6B7280;
  padding: 20rpx;
}
</style>
