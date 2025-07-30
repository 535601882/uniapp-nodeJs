<template>
  <view class="detail-page">
    <view v-if="item" class="detail-content">
      <image :src="item.image_url" mode="widthFix" class="detail-image" />
      <view class="info-card">
        <view class="author-info">
          <image :src="item.author_avatar" class="author-avatar" />
          <text class="author-name">{{ item.author_name }}</text>
        </view>
        <view class="prompt-section">
          <text class="prompt-label">提示词:</text>
          <text class="prompt-text">{{ item.prompt }}</text>
        </view>
        <view class="actions-bar">
          <view class="likes-info" @click="toggleLike">
            <text :class="['like-icon', item.is_liked ? 'liked' : '']">♥</text>
            <text>{{ item.likes }}</text>
          </view>
          <button class="save-button" @click="saveImage">保存图片</button>
        </view>
      </view>
    </view>
    <view v-else class="loading-indicator">加载中...</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { galleryApi } from '@/utils/api';

const item = ref(null);
const creationId = ref(null);

onLoad((options) => {
  creationId.value = options.id;
  fetchDetail();
});

const fetchDetail = async () => {
  if (!creationId.value) return;
  try {
    const data = await galleryApi.getDetail(creationId.value);
    item.value = data;
  } catch (error) {
    console.error('获取详情失败:', error);
    uni.showToast({
      title: '获取详情失败',
      icon: 'error',
    });
  }
};

const toggleLike = async () => {
  if (!item.value) return;
  try {
    const data = await galleryApi.toggleLike(item.value._id);
    item.value.is_liked = data.is_liked;
    item.value.likes = data.likes;
    uni.showToast({
      title: data.is_liked ? '点赞成功' : '取消点赞',
      icon: 'success',
      duration: 1000,
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'error',
    });
  }
};

const saveImage = () => {
  if (!item.value || !item.value.image_url) {
    uni.showToast({
      title: '图片地址无效',
      icon: 'none',
    });
    return;
  }
  uni.downloadFile({
    url: item.value.image_url,
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
</script>

<style scoped lang="scss">
.detail-page {
  background-color: #111827;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40rpx;
}

.detail-content {
  width: 100%;
}

.detail-image {
  width: 100%;
  height: auto;
  display: block;
}

.info-card {
  background-color: #1F2937;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  color: #E5E7EB;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  .author-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  .author-name {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.prompt-section {
  margin-bottom: 30rpx;
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
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #374151;
  padding-top: 30rpx;
  margin-top: 20rpx;
}

.likes-info {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  color: #E5E7EB;
  .like-icon {
    color: #6B7280; /* Default color for not liked */
    margin-right: 10rpx;
    font-size: 40rpx;
    &.liked {
      color: #EF4444; /* Color when liked */
    }
  }
}

.save-button {
  background-color: #4F46E5;
  color: #FFFFFF;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 10rpx;
  border: none;
  outline: none;
}

.loading-indicator {
  color: #9CA3AF;
  margin-top: 100rpx;
}
</style>
