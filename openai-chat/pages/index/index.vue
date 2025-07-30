<template>
  <view class="main-page">
    <!-- 背景图 -->
    <image class="bg-image" src="/static/bg.png" mode="aspectFill" />
    <!-- 渐变蒙层 -->
    <view class="bg-gradient"></view>
    <view class="content-wrapper">
      <view class="header-section" style="height: 400rpx; display: flex; flex-direction: column; justify-content: center; align-items: center;">
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
          <button class="action-btn" @click="saveImage">保存</button>
          <button class="action-btn" open-type="share">分享</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { imageApi, uploadFileWithToken } from '@/utils/api';

// 分享给好友
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

const prompt = ref('');
const uploadImages = ref([]);
const resultImage = ref(null);
const loading = ref(false);
const generating = ref(false);

const chooseAndUploadImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const filePath = res.tempFilePaths[0];
      uploadImages.value = [filePath]; // 只保留一张图片
    }
  });
};

const removeImage = (index) => {
  uploadImages.value.splice(index, 1);
};

    const generateImage = async () => {
      if (generating.value) return;
      if (!prompt.value && uploadImages.value.length === 0) {
        uni.showToast({ title: '请输入提示词或选择图片', icon: 'none' });
        return;
      }

      generating.value = true;
      try {
        let result;
        if (uploadImages.value.length > 0) {
          // 如果有图片，使用 uploadFileWithToken 上传文件和提示词
          result = await uploadFileWithToken({
            url: '/api/image', // 后端图片生成接口
            filePath: uploadImages.value[0], // 发送第一张选中的图片
            name: 'image', // 后端接收文件的字段名
            formData: {
              prompt: prompt.value, // 将提示词作为表单数据发送
              // 如果有 n 和 size 等其他参数，也可以在这里添加
            }
          });
        } else {
          // 如果没有图片，使用常规的 submitGeneration (发送 JSON 数据)
          result = await imageApi.submitGeneration({ prompt: prompt.value });
        }
        prompt.value = ""
        uploadImages.value = []

        uni.showToast({
          title: '生成任务已提交，请前往“我的创作”查看进度',
          icon: 'none',
          duration: 3000,
        });
        // 可以选择自动跳转到我的创作页面
        uni.navigateTo({ url: '/pages/my_creations/index' });
      } catch (error) {
        console.error('提交生成任务失败:', error);
        uni.showToast({
          title: error.msg || '提交失败',
          icon: 'error',
        });
      } finally {
        generating.value = false;
      }
    };

const previewResult = () => {
  if (resultImage.value) {
    uni.previewImage({ urls: [resultImage.value] });
  }
};

const saveImage = () => {
  if (!resultImage.value) {
    uni.showToast({ title: '没有可保存的图片', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '保存中...' });
  uni.downloadFile({
    url: resultImage.value,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading();
            uni.showToast({ title: '保存成功', icon: 'success' });
          },
          fail: (err) => {
            uni.hideLoading();
            if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
              uni.showModal({
                title: '提示',
                content: '请授权保存图片到相册',
                showCancel: false,
                success: () => {
                  uni.openSetting();
                }
              });
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' });
            }
          }
        });
      } else {
        uni.hideLoading();
        uni.showToast({ title: '图片下载失败', icon: 'none' });
      }
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({ title: '图片下载失败', icon: 'none' });
    }
  });
};

// 分享给好友
onShareAppMessage((res) => {
  if (res.from === 'button') { // 来自页面内转发按钮
    console.log('分享按钮点击', res.target);
  }
  return {
    title: '快来体验AI创作，生成你的专属图片！', // 分享标题
    path: '/pages/index/index',
    imageUrl: resultImage.value || '/static/logo.png'
  };
});

// 分享到朋友圈 (需要小程序配置)
onShareTimeline(() => {
  return {
    title: 'AI创作，一键生成惊艳图片！',
    query: 'from=timeline',
    imageUrl: resultImage.value || '/static/logo.png'
  };
});

</script>

<style scoped lang="scss">
.main-page {
  background-color: #111827;
  min-height: 100vh;
  /* Removed padding-top to allow header-section to start from top */
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-bottom: 30rpx;
  position: relative;
}
.bg-image {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 70vh;
  z-index: 0;
  pointer-events: none; // 防止遮挡内容
}
.bg-gradient {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 70vh;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(17,24,39,0) 50%, #111827 100%);
}
.content-wrapper{
  z-index: 2;
  position: relative;
}
.header-title{
  font-weight: 700;
  color: #fff;
  font-size: 60rpx;
  text-shadow: 1px 1px 2px #374151;
}
.header-subtitle{
  font-weight: 400;
  color: #fff;
  font-size: 32rpx;
  text-shadow: 1px 1px 2px #374151;
}
.header-section {
  text-align: center;
  padding: 40rpx 0;
  height: 400rpx; /* Fixed height for the background section */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1; /* Ensure it's above other elements if needed */
}
.form-card {
  background-color: rgb(31 41 55 / 80%);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-top: -100rpx; /* Pull form-card up to overlap with header-section */
  position: relative;
  z-index: 2; /* Ensure it's above header-section */
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
