<template>
	<view class="container">
		<!-- 顶部栏 -->
		<view class="top-bar">
			<text class="title">AI 智能助手</text>
			<button class="history-btn" @click="showHistory = true">历史对话</button>
		</view>
		<!-- Tab切换 -->
		<view class="tab-bar">
			<view :class="['tab', tab === 'chat' ? 'active' : '']" @click="tab = 'chat'">文本聊天</view>
			<view :class="['tab', tab === 'image' ? 'active' : '']" @click="tab = 'image'">生图</view>
		</view>
		<!-- 聊天区 -->
		<ChatView v-if="tab === 'chat'" :openid="openid" />
		<!-- 生图区 -->
		<ImageGenView v-if="tab === 'image'" :openid="openid" />
		<!-- 历史对话弹窗 -->
		<HistoryDialog v-if="showHistory" :openid="openid" @close="showHistory = false" />
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChatView from '@/components/ChatView.vue';
import ImageGenView from '@/components/ImageGenView.vue';
import HistoryDialog from '@/components/HistoryDialog.vue';
import { globalUser } from '@/utils/global';
import { getUserApi } from '@/utils/api';
console.log('globalUser',globalUser)
const tab = ref('chat');
const showHistory = ref(false);
const openid = ref(uni.getStorageSync('openid'));
const n = ref(1);


onMounted(() => {
});

function onSliderChange(e) {
	n.value = e.detail.value
}
</script>

<style scoped lang="scss">
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%);
	display: flex;
	flex-direction: column;
}
.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx 24rpx 16rpx 24rpx;
	background: #fff;
	border-bottom: 1px solid #eee;
	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #3b82f6;
	}
	.history-btn {
		font-size: 28rpx;
		color: #6366f1;
		background: #f1f5f9;
		border-radius: 32rpx;
		padding: 8rpx 24rpx;
		border: none;
	}
}
.tab-bar {
	display: flex;
	background: #f1f5f9;
	border-radius: 32rpx;
	margin: 24rpx 24rpx 0 24rpx;
	overflow: hidden;
	.tab {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		font-size: 32rpx;
		color: #64748b;
		transition: background 0.2s;
		&.active {
			background: #6366f1;
			color: #fff;
			font-weight: bold;
		}
	}
}
</style>
