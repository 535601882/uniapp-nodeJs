<template>
  <view class="chat-container">
    <!-- 聊天内容区 -->
    <scroll-view class="chat-scroll" scroll-y :scroll-into-view="scrollTo">
      <view v-for="(msg, i) in chatList" :key="i" :id="'msg-'+i" :class="['msg-row', msg.role]">
        <image class="avatar" :src="msg.role==='user'?user.avatar:ai.avatar" />
        <view class="bubble">
          <template v-if="Array.isArray(msg.content)">
            <block v-for="(item, idx) in msg.content" :key="idx">
              <text v-if="item.type==='text'">{{ item.text }}</text>
              <image v-else-if="item.type==='image_url'" :src="item.image_url.url" class="msg-img" mode="aspectFill" />
            </block>
          </template>
          <template v-else>
            <text>{{ msg.content }}</text>
          </template>
        </view>
      </view>
    </scroll-view>
    <!-- 底部输入区 -->
    <view class="chat-footer">
      <view class="input-wrap">
        <textarea
          v-model="input"
          placeholder="请输入内容..."
          :auto-height="true"
          class="chat-input"
          :style="{ minHeight: '60rpx', maxHeight: '200rpx' }"
          @confirm="sendMsg"
        />
        <view class="attachment-list" v-if="attachments.length">
          <image v-for="(img, idx) in attachments" :key="idx" :src="img" class="attach-img" mode="aspectFill" />
        </view>
      </view>
      <view class="footer-actions">
        <button class="attach-btn" @click="chooseImage">📎 附件</button>
        <button class="send-btn" @click="sendMsg">发送</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { chatApi } from '@/utils/api';
const props = defineProps({ openid: String });
const user = { avatar: '/static/user.png' };
const ai = { avatar: '/static/ai.png' };
const chatList = ref([
  { role: 'assistant', content: '你好，我是AI助手，有什么可以帮你？' }
]);
const input = ref('');
const scrollTo = ref('');
const attachments = ref([]); // 附件列表

function sendMsg() {
  if (!input.value.trim() && attachments.value.length === 0) return;
  // 构造本次消息内容
  let content;
  if (attachments.value.length === 0) {
    content = input.value;
  } else if (!input.value.trim() && attachments.value.length > 0) {
    // 只有图片
    content = attachments.value.map(img => ({ type: 'image_url', image_url: { url: img } }));
  } else {
    // 文本+图片
    content = [
      { type: 'text', text: input.value },
      ...attachments.value.map(img => ({ type: 'image_url', image_url: { url: img } }))
    ];
  }
  const msg = { role: 'user', content };
  // 构造OpenAI格式历史消息数组
  const messages = chatList.value.map(m => ({ role: m.role, content: m.content }))
    .concat(msg);
  chatList.value.push(msg);
  input.value = '';
  attachments.value = [];
  scrollTo.value = 'msg-' + (chatList.value.length - 1);
  // 请求AI回复
  chatApi(props.openid, messages).then(res => {
    if (res) {
      chatList.value.push({ role: 'assistant', content: res.reply });
      nextTick(() => {
        scrollTo.value = 'msg-' + (chatList.value.length - 1);
      });
    }
  });
}
function chooseImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      attachments.value.push(res.tempFilePaths[0]);
    }
  });
}
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f8fa;
}
.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}
.msg-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 24rpx;
  background: transparent;
  &.user {
    flex-direction: row-reverse;
    .bubble { background: #6366f1; color: #fff; }
  }
  &.assistant {
    .bubble { background: #f1f5f9; color: #222; }
  }
  .avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    margin: 0 16rpx;
  }
  .bubble {
    max-width: 70vw;
    padding: 20rpx 28rpx;
    border-radius: 32rpx;
    font-size: 30rpx;
    box-shadow: 0 2rpx 8rpx #e0e7ff;
    word-break: break-all;
    margin: 0 16rpx;
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  .msg-img {
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    margin-top: 8rpx;
  }
}
.chat-footer {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: #fff;
  box-shadow: 0 -2rpx 8rpx #e0e7ff;
  padding: 16rpx 24rpx 32rpx 24rpx;
  z-index: 10;
  width: 100vw;
}
.input-wrap {
  width: 100%;
  margin-bottom: 12rpx;
}
.chat-input {
  width: 100%;
  min-height: 60rpx;
  max-height: 200rpx;
  font-size: 32rpx;
  border-radius: 16rpx;
  border: 1px solid #e0e7ff;
  padding: 16rpx;
  background: #f9fafb;
  box-sizing: border-box;
}
.attachment-list {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}
.attach-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  object-fit: cover;
}
.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24rpx;
}
.attach-btn {
  background: #f1f5f9;
  color: #6366f1;
  border-radius: 24rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  border: none;
}
.send-btn {
  background: #6366f1;
  color: #fff;
  border-radius: 24rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  border: none;
}
</style> 