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
      <view class="image-upload-list">
        <view v-for="(img, i) in uploadImages" :key="i" class="thumb-wrap">
          <image :src="img" class="thumb-img" mode="aspectFill" @click="preview(img, 'upload')" />
          <view class="delete-btn" @click.stop="removeImage(i)">×</view>
        </view>
        <view v-if="uploadImages.length < 10" class="thumb-wrap add-thumb" @click="chooseAndUploadImage">
          <text v-if="!uploadLoading" class="plus">+</text>
          <view v-else class="upload-loading">
            <text class="loading-spinner"></text>
          </view>
        </view>
      </view>
      <button class="gen-btn" @click="genImageStream" :loading="loading">生成图片</button>
    </view>
    <view class="result-list" v-if="genImages.length">
      <image v-for="(img, i) in genImages" :key="i" :src="img" class="result-img" mode="aspectFill" @click="preview(img, 'gen')" />
    </view>
  </view>
</template>

<script setup>
import { globalUser } from '../utils/global'
import {uploadFileWithToken, imageApi } from "../utils/api"
import { ref } from 'vue';
const prompt = ref('');
const n = ref(1);
function onSliderChange(e) { n.value = e.detail.value }
const size = ref('1024x1024');
function onRadioChange(e) { size.value = e.detail.value }
const sizes = ['1024x1024', '1536x1024', '1024x1536'];
const loading = ref(false);
const uploadImages = ref([]);
const genImages = ref([]);
const progress = ref(0);
const statusText = ref('');
const uploadLoading = ref(false);

function chooseAndUploadImage() {
  const max = 10 - uploadImages.value.length;
  if (max <= 0) return;
  uni.chooseImage({
    count: max,
    success: (chooseRes) => {
      const filePaths = chooseRes.tempFilePaths;
      uploadLoading.value = true;
      let finished = 0;
      filePaths.forEach(filePath => {
        uploadFileWithToken({
          url: '/api/image/upload',
          filePath,
          name: 'image'
        }).then((res) => {
          uploadImages.value.push(res.url);
          uni.showToast({ title: '上传成功', icon: 'success' });
        }).catch(e => {
          uni.showToast({ title: '上传失败', icon: 'none' });
        }).finally(() => {
          finished++;
          if (finished === filePaths.length) {
            uploadLoading.value = false;
          }
        });
      });
    }
  });
}

function removeImage(idx) {
  uploadImages.value.splice(idx, 1);
}

function genImageStream() {
  if (!prompt.value.trim()) {
    uni.showToast({ title: '请输入描述', icon: 'none' });
    return;
  }
  loading.value = true;
  progress.value = 0;
  genImages.value = [];

  imageApi({
      prompt: prompt.value,
      n: n.value,
      size: size.value,
      images: uploadImages.value
    }).then((data) => {
      console.log('data',data)
    loading.value = false;
    if (data && data.download_links) {
      genImages.value = data.download_links;
    }
  }).catch((err) => {
    loading.value = false;
    statusText.value = err && err.msg ? err.msg : '生成失败';
  });
}
function preview(img, type = 'upload') {
  if(type === 'upload') {
    uni.previewImage({ urls: uploadImages.value, current: img });
  } else {
    uni.previewImage({ urls: genImages.value, current: img });
  }
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
.image-upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 24rpx;
  .thumb-wrap {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16rpx;
    }
    .delete-btn {
      position: absolute;
      top: 0;
      right: 0;
      width: 32rpx;
      height: 32rpx;
      background: rgba(0,0,0,0.5);
      color: #fff;
      font-size: 28rpx;
      text-align: center;
      line-height: 32rpx;
      border-radius: 0 0 0 16rpx;
      z-index: 2;
    }
  }
  .add-thumb {
    border: 2rpx dashed #cbd5e1;
    background: #f9fafb;
    cursor: pointer;
    .plus {
      font-size: 60rpx;
      color: #cbd5e1;
      line-height: 120rpx;
      text-align: center;
      width: 100%;
      display: block;
    }
  }
}
.upload-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 6rpx solid #cbd5e1;
  border-top: 6rpx solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 