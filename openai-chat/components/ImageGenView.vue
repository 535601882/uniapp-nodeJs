<template>
  <view class="image-gen-view">
    <view class="form">
      <textarea
        v-model="prompt"
        class="input-textarea"
        placeholder="请输入图片描述..."
        :auto-height="true"
        :maxlength="200"
        rows="1"
      />
      <view class="row flex-row">
        <text class="label">数量</text>
        <view class="slider-wrap">
          <slider min="1" max="10" :value="n" @change="onSliderChange" show-value />
        </view>
        <text class="value">{{ n }}</text>
      </view>
      <view class="row radio-vertical-row">
        <text class="label">尺寸</text>
        <view class="radio-list">
          <label v-for="s in sizes" :key="s" class="radio-item">
            <text>{{ s }}</text>
            <radio :value="s" :checked="size===s" @click="onRadioChange({ detail: { value: s } })" />
          </label>
        </view>
      </view>
      <button class="gen-btn" @click="genImageStream" :loading="loading">流式生成图片</button>
    </view>
    <view class="progress-bar" v-if="loading">
      <text>{{ statusText }}</text>
      <progress :percent="progress" show-info stroke-width="6" />
    </view>
    <view class="result-list" v-if="images.length">
      <image v-for="(img, i) in images" :key="i" :src="img" class="result-img" mode="aspectFill" @click="preview(img)" />
    </view>
  </view>
</template>

<script setup>
import { globalUser } from '../utils/global'
import { ref } from 'vue';
const prompt = ref('');
const n = ref(1);
function onSliderChange(e) { n.value = e.detail.value }
const size = ref('1024x1024');
function onRadioChange(e) { size.value = e.detail.value }
const sizes = ['1024x1024', '1536x1024', '1024x1536'];
const loading = ref(false);
const images = ref([]);
const progress = ref(0);
const statusText = ref('');

function genImageStream() {
  if (!prompt.value.trim()) {
    uni.showToast({ title: '请输入描述', icon: 'none' });
    return;
  }
  loading.value = true;
  images.value = [];
  progress.value = 0;
  statusText.value = '生成中...';

  uni.request({
    url: import.meta.env.VITE_BASE_URL + '/api/image',
    method: 'POST',
    data: {
      prompt: prompt.value,
      n: n.value,
      size: size.value
    },
    header: {
      'Content-Type': 'application/json',
      token: globalUser.token || uni.getStorageSync('token') || ''
    },
    success: (res) => {
      loading.value = false;
      if (res.data && res.data.code === 0 && res.data.data && res.data.data.download_links) {
        images.value = res.data.data.download_links;
        statusText.value = '生成完成';
      } else {
        statusText.value = res.data.msg || '生成失败';
      }
    },
    fail: () => {
      loading.value = false;
      statusText.value = '生成失败';
    }
  });
}
function preview(img) {
  uni.previewImage({ urls: images.value, current: img });
}
</script>

<style scoped lang="scss">
.image-gen-view {
  padding: 32rpx;
  .form {
    background: #fff;
    border-radius: 32rpx;
    box-shadow: 0 2rpx 12rpx #e0e7ff;
    padding: 32rpx;
    margin-bottom: 32rpx;
    .input-textarea {
      width: 100%;
      min-height: 48rpx;
      max-height: 200rpx;
      font-size: 32rpx;
      border-radius: 16rpx;
      border: 1px solid #e0e7ff;
      padding: 16rpx;
      background: #f9fafb;
      box-sizing: border-box;
      resize: none;
    }
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      text {
        margin-right: 16rpx;
      }
      .radio-label {
        margin-right: 24rpx;
        font-size: 28rpx;
      }
    }
    .gen-btn {
      width: 100%;
      background: #6366f1;
      color: #fff;
      border-radius: 24rpx;
      padding: 20rpx 0;
      font-size: 32rpx;
    }
  }
  .progress-bar {
    margin-bottom: 24rpx;
    text {
      margin-right: 16rpx;
    }
    progress {
      width: 100%;
      height: 12rpx;
      border-radius: 6rpx;
      background-color: #e0e7ff;
      overflow: hidden;
      .progress-bar {
        background-color: #6366f1;
        height: 100%;
      }
    }
  }
  .result-list {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    .result-img {
      width: 320rpx;
      height: 320rpx;
      border-radius: 24rpx;
      box-shadow: 0 2rpx 8rpx #e0e7ff;
      margin-bottom: 16rpx;
    }
  }
}
.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.label {
  flex: 0 0 auto;
  font-size: 30rpx;
  color: #64748b;
  margin-right: 16rpx;
}
.slider-wrap {
  flex: 1 1 auto;
  margin: 0 16rpx;
}
.value {
  flex: 0 0 auto;
  font-size: 30rpx;
  color: #6366f1;
  margin-left: 8rpx;
}
.radio-vertical-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 24rpx;
}
.radio-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 8rpx;
}
.radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}
</style> 