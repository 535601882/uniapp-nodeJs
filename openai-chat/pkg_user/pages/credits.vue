<template>
  <view class="credits-page">
    <view class="summary-box">
      <text class="current-balance-label">当前积分</text>
      <text class="current-balance-value">{{ currentBalance }}</text>
      <button class="buy-button" @click="goToPackages">购买积分</button>
    </view>

    <text class="records-title">交易历史</text>
    <scroll-view scroll-y class="records-scroll" @scrolltolower="loadMore">
      <view v-if="records.length === 0 && !loading" class="empty-state">
        <text>暂无记录。</text>
      </view>
      <view v-else class="records-list">
        <view v-for="record in records" :key="record.id" class="record-item">
          <view class="item-details">
            <text class="item-description">{{ record.description }}</text>
            <text class="item-date">{{ new Date(record.created_at).toLocaleDateString() }}</text>
          </view>
          <text :class="['item-amount', record.amount > 0 ? 'positive' : 'negative']">
            {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
          </text>
        </view>
      </view>
      <view v-if="loading" class="loading-indicator">加载中...</view>
      <view v-if="!hasMore && records.length > 0" class="end-indicator">- 到底了 -</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { balanceApi, userApi } from '@/utils/api';

const records = ref([]);
const currentBalance = ref(0);
const page = ref(1);
const limit = ref(20);
const hasMore = ref(true);
const loading = ref(false);

const fetchRecords = async (reset = false) => {
  if (loading.value || (!reset && !hasMore.value)) return;
  loading.value = true;

  if (reset) {
    page.value = 1;
    records.value = [];
    hasMore.value = true;
  }

  try {
    const data = await balanceApi.getRecords({ page: page.value, limit: limit.value });
    records.value = [...records.value, ...data.items];
    if (records.value.length >= data.total) {
      hasMore.value = false;
    }
    page.value++;
  } catch (error) {
    console.error('获取记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchBalance = async () => {
  try {
    const profile = await userApi.getProfile();
    currentBalance.value = profile.credits;
  } catch (error) {
    console.error('获取余额失败:', error);
  }
};

const loadMore = () => {
  fetchRecords();
};

const goToPackages = () => {
  // Later, this will navigate to a purchase page
  uni.showToast({ title: '购买功能即将上线！', icon: 'none' });
};

onMounted(() => {
  fetchBalance();
  fetchRecords(true);
});
</script>

<style scoped lang="scss">
.credits-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 30rpx;
  color: #E5E7EB;
}
.summary-box {
  background-color: #1F2937;
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
  .current-balance-label {
    display: block;
    font-size: 28rpx;
    color: #9CA3AF;
  }
  .current-balance-value {
    display: block;
    font-size: 72rpx;
    font-weight: bold;
    color: #FFFFFF;
    margin: 20rpx 0;
  }
  .buy-button {
    background: linear-gradient(to right, #4F46E5, #7C3AED);
    color: #FFFFFF;
    border-radius: 16rpx;
    padding: 20rpx 0;
    font-size: 30rpx;
    width: 60%;
    margin: 20rpx auto 0;
  }
}
.records-title {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
}
.records-scroll {
  height: calc(100vh - 450rpx); // Adjust based on summary box height
}
.records-list {
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1F2937;
    padding: 25rpx;
    border-radius: 12rpx;
    margin-bottom: 15rpx;
    .item-details {
      .item-description {
        font-size: 28rpx;
        display: block;
      }
      .item-date {
        font-size: 24rpx;
        color: #6B7280;
        display: block;
        margin-top: 5rpx;
      }
    }
    .item-amount {
      font-size: 32rpx;
      font-weight: 500;
      &.positive {
        color: #10B981; // Green
      }
      &.negative {
        color: #EF4444; // Red
      }
    }
  }
}
.loading-indicator, .end-indicator, .empty-state {
  text-align: center;
  color: #6B7280;
  padding: 40rpx;
}
</style>