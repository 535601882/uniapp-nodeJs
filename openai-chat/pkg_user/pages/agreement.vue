<template>
  <view class="content-page">
    <rich-text :nodes="content"></rich-text>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { commonApi } from '@/utils/api';

const content = ref('');

onMounted(async () => {
  try {
    const res = await commonApi.getAgreement();
	console.log('res',res)
    uni.setNavigationBarTitle({ title: res.title });
    content.value = res.content;
  } catch (error) {
    console.error('加载用户协议失败:', error);
  }
});
</script>

<style scoped lang="scss">
.content-page {
  padding: 30rpx;
  background-color: #111827;
  color: #E5E7EB;
  min-height: 100vh;
}
</style>