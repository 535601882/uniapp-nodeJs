<template>
  <view class="profile-page">
    <view class="header">
      <image :src="user.avatar_url || '/static/user.png'" class="avatar" @click="getUserProfile" />
      <text class="nickname" @click="getUserProfile">{{ user.nickname || '点击获取微信信息' }}</text>
      <view class="credits-badge">
        <text class="credits-text">积分: {{ user.credits }}</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pkg_history/pages/list')">
        <text class="menu-icon">📜</text>
        <text>我的创作</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pkg_user/pages/credits')">
        <text class="menu-icon">💰</text>
        <text>积分记录</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pkg_user/pages/tasks')">
        <text class="menu-icon">🎯</text>
        <text>任务中心</text>
        <text class="arrow">></text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pkg_user/pages/feedback')">
        <text class="menu-icon">✉️</text>
        <text>意见反馈</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pkg_user/pages/settings')">
        <text class="menu-icon">⚙️</text>
        <text>设置</text>
        <text class="arrow">></text>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userApi } from '@/utils/api';
import { globalUser } from '@/utils/global';

const user = ref({});

const fetchProfile = async () => {
  try {
    // 优先从本地存储获取昵称和头像
    const localNickname = uni.getStorageSync('nickname');
    const localAvatar = uni.getStorageSync('avatar');

    if (localNickname) {
      user.value.nickname = localNickname;
    }
    if (localAvatar) {
      user.value.avatar_url = localAvatar;
    }

    // 从API获取完整资料（用于积分和可能更新的信息）
    const apiProfile = await userApi.getProfile();
    user.value = { ...user.value, ...apiProfile }; // 合并本地和API数据

  } catch (error) {
    console.error('获取资料失败:', error);
    uni.showToast({ title: '加载数据失败', icon: 'none' });
  }
};

const getUserProfile = () => {
  uni.getUserProfile({
    desc: '用于展示您的头像和昵称',
    success: (res) => {
      const { nickName, avatarUrl } = res.userInfo;
      user.value.nickname = nickName;
      user.value.avatar_url = avatarUrl;
      uni.setStorageSync('nickname', nickName);
      uni.setStorageSync('avatar', avatarUrl);
      // 如果有后端接口，这里可以调用userApi.updateProfile(nickName, avatarUrl)同步到后端
      // userApi.updateProfile({ nickname: nickName, avatar_url: avatarUrl }).then(() => {
      //   uni.showToast({ title: '信息已更新', icon: 'success' });
      // }).catch(err => {
      //   console.error('同步用户信息到后端失败:', err);
      // });
    },
    fail: (err) => {
      console.log('用户拒绝授权:', err);
      uni.showToast({ title: '您已拒绝授权', icon: 'none' });
    }
  });
};

const navigateTo = (url) => {
  uni.navigateTo({ url });
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped lang="scss">
.profile-page {
  background-color: #111827;
  min-height: 100vh;
  color: #E5E7EB;
}
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background-color: #1F2937;
  .avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 4rpx solid #4F46E5;
    margin-bottom: 20rpx;
  }
  .nickname {
    font-size: 40rpx;
    font-weight: bold;
    color: #FFFFFF;
  }
  .credits-badge {
    margin-top: 20rpx;
    background-color: #4F46E5;
    padding: 8rpx 24rpx;
    border-radius: 30rpx;
    .credits-text {
      color: #FFFFFF;
      font-size: 24rpx;
    }
  }
}
.menu-list {
  margin: 30rpx;
  background-color: #1F2937;
  border-radius: 16rpx;
  overflow: hidden;
  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #374151;
    &:last-child {
      border-bottom: none;
    }
    .menu-icon {
      font-size: 40rpx;
      width: 40rpx; /* Explicit width for icon */
      flex-shrink: 0; /* Prevent icon from shrinking */
      margin-right: 20rpx; /* Adjusted margin for better spacing */
      flex: 0;
    }
    text {
      flex: 1;
      font-size: 30rpx;
    }
    .arrow {
      flex: 0 0 auto;
      color: #6B7280;
      font-size: 30rpx;
    }
  }
}
</style>
