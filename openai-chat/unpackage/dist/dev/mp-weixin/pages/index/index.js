"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_global = require("../../utils/global.js");
if (!Math) {
  (ChatView + ImageGenView + HistoryDialog)();
}
const ChatView = () => "../../components/ChatView.js";
const ImageGenView = () => "../../components/ImageGenView.js";
const HistoryDialog = () => "../../components/HistoryDialog.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.index.__f__("log", "at pages/index/index.vue:29", "globalUser", utils_global.globalUser);
    const tab = common_vendor.ref("chat");
    const showHistory = common_vendor.ref(false);
    const openid = common_vendor.ref(common_vendor.index.getStorageSync("openid"));
    common_vendor.ref(1);
    common_vendor.onMounted(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showHistory.value = true),
        b: common_vendor.n(tab.value === "chat" ? "active" : ""),
        c: common_vendor.o(($event) => tab.value = "chat"),
        d: common_vendor.n(tab.value === "image" ? "active" : ""),
        e: common_vendor.o(($event) => tab.value = "image"),
        f: tab.value === "chat"
      }, tab.value === "chat" ? {
        g: common_vendor.p({
          openid: openid.value
        })
      } : {}, {
        h: tab.value === "image"
      }, tab.value === "image" ? {
        i: common_vendor.p({
          openid: openid.value
        })
      } : {}, {
        j: showHistory.value
      }, showHistory.value ? {
        k: common_vendor.o(($event) => showHistory.value = false),
        l: common_vendor.p({
          openid: openid.value
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
