<template>
  <view class="main-page">
    <view class="content-wrapper">
      <view class="header-section">
        <image src="/static/ai.png" class="header-logo" mode="aspectFit" />
        <text class="header-title">AI创作引擎</text>
        <text class="header-subtitle">即刻将您的想法变为现实。</text>
      </view>

      <view class="form-card">
        <textarea
          v-model="prompt"
          class="prompt-input"
          placeholder="描述您的想法... (例如：一只穿着宇航服的猫，超写实风格)"
          :auto-height="true"
        />
        
        <view class="image-preview-list">
          <view v-for="(img, i) in uploadImages" :key="i" class="thumb-item">
            <image :src="img" class="thumb-image" mode="aspectFill" />
            <view class="thumb-remove" @click.stop="removeImage(i)">×</view>
          </view>
          <view v-if="uploadImages.length < 1" class="thumb-add" @click="chooseAndUploadImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>

        <button class="generate-button" @click="generateImage" :loading="loading">
          <text>生成</text>
          <text class="credit-cost">(-1 积分)</text>
        </button>
      </view>

      <view v-if="resultImage" class="result-section">
        <image :src="resultImage" class="result-image" mode="widthFix" @click="previewResult" />
        <view class="result-actions">
          <button class="action-btn">保存</button>
          <button class="action-btn">分享</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { imageApi, uploadFileWithToken } from '@/utils/api';

const prompt = ref('');
const uploadImages = ref([]);
const resultImage = ref(null);
const loading = ref(false);

const chooseAndUploadImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const filePath = res.tempFilePaths[0];
      uni.showLoading({ title: '上传中...' });
      uploadFileWithToken({
        url: '/api/image/upload',
        filePath,
        name: 'image'
      }).then((uploadRes) => {
        uploadImages.value.push(uploadRes.url);
        uni.hideLoading();
      }).catch(err => {
        uni.hideLoading();
        uni.showToast({ title: '上传失败', icon: 'none' });
      });
    }
  });
};

const removeImage = (index) => {
  uploadImages.value.splice(index, 1);
};

const generateImage = async () => {
  if (!prompt.value.trim() && uploadImages.value.length === 0) {
    uni.showToast({ title: '请输入描述或上传图片', icon: 'none' });
    return;
  }
  loading.value = true;
  resultImage.value = null;
  try {
    const res = await imageApi.generate({
      prompt: prompt.value,
      images: uploadImages.value,
      n: 1,
      size: '1024x1024' // 简化示例
    });
    if (res.download_links && res.download_links.length > 0) {
      resultImage.value = res.download_links[0];
    } else {
        // 如果没有直接链接，则回退到占位符
        const content = res.choices[0].message.content;
        const urlMatch = content.match(/https?:\/\/[^\s)]+\.png/);
        if(urlMatch) {
            resultImage.value = urlMatch[0];
        } else {
            uni.showToast({ title: '响应中未找到图片URL', icon: 'none' });
        }
    }
  } catch (error) {
    uni.showToast({ title: error.msg || '生成失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const previewResult = () => {
  if (resultImage.value) {
    uni.previewImage({ urls: [resultImage.value] });
  }
};

</script>

<style scoped lang="scss">
.main-page {
  background-color: #111827;
  min-height: 100vh;
  padding: 30rpx;
}
.content-wrapper {
  width: 100%;
}
.header-section {
  text-align: center;
  padding: 40rpx 0;
  .header-logo {
    width: 120rpx;
    height: 120rpx;
  }
  .header-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #FFFFFF;
    margin-top: 20rpx;
  }
  .header-subtitle {
    display: block;
    font-size: 28rpx;
    color: #9CA3AF;
    margin-top: 10rpx;
  }
}
.form-card {
  background-color: #1F2937;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-top: 30rpx;
}
.prompt-input {
  width: 100%;
  background-color: #374151;
  color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 30rpx;
  min-height: 120rpx;
  box-sizing: border-box;
  &::placeholder {
    color: #6B7280;
  }
}
.image-preview-list {
  margin-top: 20rpx;
  display: flex;
  gap: 20rpx;
}
.thumb-item, .thumb-add {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  position: relative;
}
.thumb-item {
  .thumb-image {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
  }
  .thumb-remove {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: #EF4444;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    line-height: 1;
  }
}
.thumb-add {
  background-color: #374151;
  border: 2rpx dashed #6B7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  .add-icon {
    font-size: 60rpx;
    line-height: 1;
  }
  .add-text {
    font-size: 24rpx;
    margin-top: 10rpx;
  }
}
.generate-button {
  margin-top: 30rpx;
  width: 100%;
  background: linear-gradient(to right, #4F46E5, #7C3AED);
  color: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  .credit-cost {
    font-size: 24rpx;
    opacity: 0.8;
  }
}
.result-section {
  margin-top: 40rpx;
  .result-image {
    width: 100%;
    border-radius: 24rpx;
    background-color: #1F2937;
  }
  .result-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    .action-btn {
      flex: 1;
      background-color: #374151;
      color: #E5E7EB;
      border-radius: 16rpx;
      padding: 20rpx 0;
      font-size: 28rpx;
    }
  }
}
</style>