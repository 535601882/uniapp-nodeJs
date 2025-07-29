<template>
  <view class="tasks-page">
    <view class="header">
      <text class="header-title">任务中心</text>
      <text class="header-subtitle">完成任务赚取免费积分</text>
    </view>
    <view class="task-list">
      <view v-for="task in tasks" :key="task.id" :class="['task-item', {completed: task.completed}]">
        <view class="task-info">
          <text class="task-title">{{ task.title }}</text>
          <text class="task-description">{{ task.description }}</text>
        </view>
        <view class="task-action">
          <button v-if="!task.completed" class="action-button" @click="doTask(task)">
            去完成
          </button>
          <text v-else class="completed-text">已完成</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userApi } from '@/utils/api';

const tasks = ref([]);

const fetchTasks = async () => {
  try {
    const data = await userApi.getTasks();
    tasks.value = data.tasks;
  } catch (error) {
    console.error('获取任务失败:', error);
  }
};

const doTask = async (task) => {
  if (task.id === 'task_1') { // Daily Check-in
    try {
      const res = await userApi.checkIn();
      uni.showToast({ title: res.msg, icon: 'success' });
      fetchTasks(); // Refresh list
    } catch (error) {
      uni.showToast({ title: error.msg || '签到失败', icon: 'none' });
    }
  } else {
    uni.showToast({ title: '此任务需要手动完成', icon: 'none' });
  }
};

onMounted(() => {
  fetchTasks();
});
</script>

<style scoped lang="scss">
.tasks-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 30rpx;
}
.header {
  text-align: center;
  padding: 40rpx 0;
  .header-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #FFFFFF;
    display: block;
  }
  .header-subtitle {
    font-size: 28rpx;
    color: #9CA3AF;
    margin-top: 10rpx;
  }
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1F2937;
  padding: 30rpx;
  border-radius: 16rpx;
  border-left: 8rpx solid #4F46E5;

  &.completed {
    border-left-color: #10B981;
    opacity: 0.7;
  }

  .task-info {
    .task-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #E5E7EB;
      display: block;
    }
    .task-description {
      font-size: 26rpx;
      color: #9CA3AF;
      margin-top: 8rpx;
    }
  }

  .task-action {
    .action-button {
      background-color: #4F46E5;
      color: #FFFFFF;
      border-radius: 12rpx;
      padding: 10rpx 30rpx;
      font-size: 28rpx;
    }
    .completed-text {
      font-size: 28rpx;
      color: #10B981;
      font-weight: bold;
    }
  }
}
</style>