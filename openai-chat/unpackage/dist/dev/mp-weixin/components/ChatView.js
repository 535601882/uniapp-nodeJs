"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("../utils/api.js");
const _sfc_main = {
  __name: "ChatView",
  props: { openid: String },
  setup(__props) {
    const props = __props;
    const user = { avatar: "/static/user.png" };
    const ai = { avatar: "/static/ai.png" };
    const chatList = common_vendor.ref([
      { role: "assistant", content: "你好，我是AI助手，有什么可以帮你？" }
    ]);
    const input = common_vendor.ref("");
    const scrollTo = common_vendor.ref("");
    const attachments = common_vendor.ref([]);
    function sendMsg() {
      if (!input.value.trim() && attachments.value.length === 0)
        return;
      let content;
      if (attachments.value.length === 0) {
        content = input.value;
      } else if (!input.value.trim() && attachments.value.length > 0) {
        content = attachments.value.map((img) => ({ type: "image_url", image_url: { url: img } }));
      } else {
        content = [
          { type: "text", text: input.value },
          ...attachments.value.map((img) => ({ type: "image_url", image_url: { url: img } }))
        ];
      }
      const msg = { role: "user", content };
      const messages = chatList.value.map((m) => ({ role: m.role, content: m.content })).concat(msg);
      chatList.value.push(msg);
      input.value = "";
      attachments.value = [];
      scrollTo.value = "msg-" + (chatList.value.length - 1);
      utils_api.chatApi(props.openid, messages).then((res) => {
        if (res) {
          chatList.value.push({ role: "assistant", content: res.reply });
          common_vendor.nextTick$1(() => {
            scrollTo.value = "msg-" + (chatList.value.length - 1);
          });
        }
      });
    }
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          attachments.value.push(res.tempFilePaths[0]);
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(chatList.value, (msg, i, i0) => {
          return common_vendor.e({
            a: msg.role === "user" ? user.avatar : ai.avatar,
            b: Array.isArray(msg.content)
          }, Array.isArray(msg.content) ? {
            c: common_vendor.f(msg.content, (item, idx, i1) => {
              return common_vendor.e({
                a: item.type === "text"
              }, item.type === "text" ? {
                b: common_vendor.t(item.text)
              } : item.type === "image_url" ? {
                d: item.image_url.url
              } : {}, {
                c: item.type === "image_url",
                e: idx
              });
            })
          } : {
            d: common_vendor.t(msg.content)
          }, {
            e: i,
            f: "msg-" + i,
            g: common_vendor.n(msg.role)
          });
        }),
        b: scrollTo.value,
        c: common_vendor.o(sendMsg),
        d: input.value,
        e: common_vendor.o(($event) => input.value = $event.detail.value),
        f: attachments.value.length
      }, attachments.value.length ? {
        g: common_vendor.f(attachments.value, (img, idx, i0) => {
          return {
            a: idx,
            b: img
          };
        })
      } : {}, {
        h: common_vendor.o(chooseImage),
        i: common_vendor.o(sendMsg)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b1e81fad"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ChatView.js.map
