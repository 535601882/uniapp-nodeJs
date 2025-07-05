<template>
  <view class="history-dialog-mask" @click.self="$emit('close')">
    <view class="history-dialog">
      <view class="header">
        <text>历史对话</text>
        <button class="close-btn" @click="$emit('close')">关闭</button>
      </view>
      <scroll-view scroll-y class="history-list">
        <view v-for="(item, i) in history" :key="i" class="history-item">
          <text class="time">{{ formatTime(item.time) }}</text>
          <text class="msg">{{ item.messages?.[item.messages.length-1]?.content }}</text>
        </view>
        <view v-if="!history.length" class="empty">暂无历史</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getHistoryApi } from '@/utils/api';
const props = defineProps({ openid: String });
const history = ref([]);
function formatTime(t) {
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
}
onMounted(() => {
  getHistoryApi(props.openid).then(res => {
    history.value = res || [];
  });
});
</script>

<style scoped lang="scss">
.history-dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.history-dialog {
  width: 80vw;
  max-width: 600rpx;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx #e0e7ff;
  padding: 32rpx 0 0 0;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 32rpx 24rpx 32rpx;
    border-bottom: 1px solid #eee;
    font-size: 32rpx;
    .close-btn {
      background: #f1f5f9;
      color: #6366f1;
      border-radius: 24rpx;
      padding: 8rpx 24rpx;
      font-size: 28rpx;
    }
  }
  .history-list {
    max-height: 60vh;
    padding: 24rpx 32rpx;
    .history-item {
      margin-bottom: 24rpx;
      .time {
        color: #94a3b8;
        font-size: 24rpx;
        margin-right: 16rpx;
      }
      .msg {
        color: #222;
        font-size: 28rpx;
      }
    }
    .empty {
      text-align: center;
      color: #94a3b8;
      margin-top: 48rpx;
    }
  }
}
</style> 