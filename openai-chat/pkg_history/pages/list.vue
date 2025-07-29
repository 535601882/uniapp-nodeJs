<template>
  <view class="history-page">
    <scroll-view scroll-y class="history-scroll" @scrolltolower="loadMore">
      <view v-if="items.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无创作。</text>
        <text class="empty-subtext">在主页开始创作吧！</text>
      </view>
      <view v-else class="history-list">
        <view v-for="item in items" :key="item.id" class="history-item" @click="goToDetail(item.id)">
          <image :src="item.image_url" class="item-thumbnail" mode="aspectFill" />
          <view class="item-info">
            <text class="item-prompt">{{ item.prompt }}</text>
            <text class="item-date">{{ new Date(item.created_at).toLocaleString() }}</text>
          </view>
          <text class="arrow">></text>
        </view>
      </view>
      <view v-if="loading" class="loading-indicator">加载中...</view>
      <view v-if="!hasMore && items.length > 0" class="end-indicator">- 到底了 -</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { historyApi } from '@/utils/api';

const items = ref([]);
const page = ref(1);
const limit = ref(15);
const hasMore = ref(true);
const loading = ref(false);

const fetchHistory = async (reset = false) => {
  if (loading.value || (!reset && !hasMore.value)) return;
  loading.value = true;

  if (reset) {
    page.value = 1;
    items.value = [];
    hasMore.value = true;
  }

  try {
    const data = await historyApi.getList({ page: page.value, limit: limit.value });
    items.value = [...items.value, ...data.items];
    if (items.value.length >= data.total) {
      hasMore.value = false;
    }
    page.value++;
  } catch (error) {
    console.error('获取历史记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  fetchHistory();
};

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pkg_history/pages/detail?id=${id}` });
};

onMounted(() => {
  fetchHistory(true);
});
</script>

<style scoped lang="scss">
.history-page {
  background-color: #111827;
  min-height: 100vh;
}
.history-scroll {
  height: 100vh;
}
.history-list {
  padding: 20rpx;
}
.history-item {
  display: flex;
  align-items: center;
  background-color: #1F2937;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  .item-thumbnail {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background-color: #374151;
  }
  .item-info {
    flex: 1;
    color: #E5E7EB;
    .item-prompt {
      font-size: 28rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-date {
      font-size: 24rpx;
      color: #6B7280;
      margin-top: 10rpx;
    }
  }
  .arrow {
    color: #6B7280;
    font-size: 30rpx;
  }
}
.loading-indicator, .end-indicator {
  text-align: center;
  color: #6B7280;
  padding: 20rpx;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  color: #6B7280;
  .empty-icon {
    font-size: 100rpx;
  }
  .empty-text {
    font-size: 32rpx;
    margin-top: 20rpx;
  }
  .empty-subtext {
    font-size: 26rpx;
    margin-top: 10rpx;
  }
}
</style>