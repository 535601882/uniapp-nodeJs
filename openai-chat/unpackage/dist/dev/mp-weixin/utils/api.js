"use strict";
const common_vendor = require("../common/vendor.js");
const utils_global = require("./global.js");
const BASE = "http://localhost:3000";
function requestWithToken(options, retry = true) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      //永不超时
      timeout: 6e5,
      //600秒
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        token: utils_global.globalUser.token || common_vendor.index.getStorageSync("token") || ""
      },
      success: (res) => {
        if (res.data.code === 401 && retry) {
          refreshTokenApi().then((newToken) => {
            utils_global.globalUser.token = newToken;
            common_vendor.index.setStorageSync("token", newToken);
            requestWithToken(options, false).then(resolve).catch(reject);
          });
        } else if (res.data.code !== 0) {
          common_vendor.index.showToast({ title: res.data.msg || "请求失败", icon: "none" });
          reject(res.data);
        } else {
          resolve(res.data.data);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      }
    });
  });
}
function refreshTokenApi() {
  return requestWithToken({
    url: "/api/token",
    method: "POST"
  }).then((res) => res.token);
}
function chatApi(openid, messages) {
  return requestWithToken({
    url: "/api/chat",
    method: "POST",
    data: { openid, messages }
  });
}
function getHistoryApi(openid) {
  return requestWithToken({
    url: "/api/history/" + openid,
    method: "GET"
  });
}
exports.chatApi = chatApi;
exports.getHistoryApi = getHistoryApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
