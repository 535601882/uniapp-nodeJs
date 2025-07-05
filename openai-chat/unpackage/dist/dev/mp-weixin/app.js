"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_global = require("./utils/global.js");
if (!Math) {
  "./pages/index/index.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
    common_vendor.index.login({
      provider: "weixin",
      success: (loginRes) => {
        const code = loginRes.code;
        common_vendor.index.__f__("log", "at App.vue:12", "code", code);
        common_vendor.index.request({
          url: "http://localhost:3000/api/wxlogin",
          method: "POST",
          data: { code },
          success: (res) => {
            common_vendor.index.__f__("log", "at App.vue:19", "res", res);
            const openid = res.data.openid;
            utils_global.globalUser.openid = openid;
            common_vendor.index.setStorageSync("openid", openid);
            utils_global.globalUser.token = res.data.token;
            utils_global.globalUser.info = res.data;
            common_vendor.index.setStorageSync("token", res.data.token);
          }
        });
      }
    });
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:32", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:35", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
