<template>
  <view class="gallery-page">
    <view class="toggle-bar">
      <text :class="{active: sort === 'newest'}" @click="changeSort('newest')">最新</text>
      <text :class="{active: sort === 'hottest'}" @click="changeSort('hottest')">最热</text>
    </view>
    <scroll-view scroll-y class="gallery-scroll" @scrolltolower="loadMore">
      <view class="gallery-grid">
        <view v-for="item in items" :key="item.id" class="gallery-item" @click="goToDetail(item)">
          <image :src="item.image_url" mode="aspectFill" class="item-image" />
          <view class="item-overlay">
            <text class="item-prompt">{{ item.prompt }}</text>
            <view class="item-footer">
              <view class="author-info">
                <image :src="item.author_avatar" class="author-avatar" />
                <text class="author-name">{{ item.author_name }}</text>
              </view>
              <view class="likes-info">
                <text class="like-icon">♥</text>
                <text>{{ item.likes }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading-indicator">加载中...</view>
      <view v-if="!hasMore" class="end-indicator">- 到底了 -</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { galleryApi } from '@/utils/api';

const items = ref([]);
const sort = ref('newest');
const page = ref(1);
const limit = ref(10);
const hasMore = ref(true);
const loading = ref(false);

const fetchGallery = async (reset = false) => {
  if (loading.value || (!reset && !hasMore.value)) return;
  loading.value = true;

  if (reset) {
    page.value = 1;
    items.value = [];
    hasMore.value = true;
  }

  try {
    const data = await galleryApi.getPublic({ page: page.value, limit: limit.value, sort: sort.value });
    items.value = [...items.value, ...data.items];
    if (items.value.length >= data.total) {
      hasMore.value = false;
    }
    page.value++;
  } catch (error) {
    console.error('获取画廊失败:', error);
  } finally {
    loading.value = false;
  }
};

const changeSort = (newSort) => {
  if (sort.value === newSort) return;
  sort.value = newSort;
  fetchGallery(true);
};

const loadMore = () => {
  fetchGallery();
};

const goToDetail = (item) => {
  uni.previewImage({
    urls: [item.image_url],
    current: item.image_url,
    success: () => {
      uni.showToast({
        title: `提示词: ${item.prompt}`,
        icon: 'none',
        duration: 3000
      });
    }
  });
};

onMounted(() => {
  fetchGallery(true);
});
</script>

<style scoped lang="scss">
.gallery-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #111827;
}
.toggle-bar {
  display: flex;
  justify-content: center;
  padding: 20rpx;
  background-color: #1F2937;
  text {
    padding: 10rpx 30rpx;
    color: #9CA3AF;
    font-weight: 500;
    &.active {
      color: #FFFFFF;
      border-bottom: 2px solid #4F46E5;
    }
  }
}
.gallery-scroll {
  flex: 1;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rpx;
}
.gallery-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Creates a square aspect ratio */
  background-color: #374151;
  .item-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .item-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16rpx;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
    color: #FFFFFF;
    .item-prompt {
      font-size: 24rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10rpx;
      .author-info {
        display: flex;
        align-items: center;
        .author-avatar {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          margin-right: 10rpx;
        }
        .author-name {
          font-size: 22rpx;
          color: #E5E7EB;
        }
      }
      .likes-info {
        display: flex;
        align-items: center;
        font-size: 22rpx;
        .like-icon {
          color: #EF4444;
          margin-right: 6rpx;
        }
      }
    }
  }
}
.loading-indicator, .end-indicator {
  text-align: center;
  color: #6B7280;
  padding: 20rpx;
}
</style>