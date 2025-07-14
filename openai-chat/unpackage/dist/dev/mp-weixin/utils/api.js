"use strict";
const common_vendor = require("../common/vendor.js");
const utils_global = require("./global.js");
const BASE = "http://localhost:3000";
function requestWithToken(options, retry = true, noRefresh = false) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      //永不超时
      timeout: 6e5,
      //600秒
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        token: utils_global.globalUser.token || common_vendor.index.getStorageSync("token") || "",
        refreshToken: utils_global.globalUser.refreshToken || common_vendor.index.getStorageSync("refreshToken") || ""
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/api.js:18", "res", res);
        if (res.data.code === 401 && retry && !noRefresh) {
          common_vendor.index.__f__("log", "at utils/api.js:20", "requestWithToken 重新请求");
          refreshTokenApi().then(({ token: newToken, refreshToken: newRefreshToken }) => {
            utils_global.globalUser.token = newToken;
            utils_global.globalUser.refreshToken = newRefreshToken;
            common_vendor.index.setStorageSync("token", newToken);
            common_vendor.index.setStorageSync("refreshToken", newRefreshToken);
            requestWithToken(options, false).then(resolve).catch(reject);
          }).catch(() => {
            utils_global.globalUser.token = "";
            utils_global.globalUser.refreshToken = "";
            common_vendor.index.setStorageSync("token", "");
            common_vendor.index.setStorageSync("refreshToken", "");
            common_vendor.index.showToast({ title: "登录已过期，请重新登录", icon: "none" });
            reject(res.data);
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
function uploadFileWithToken(options) {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      ...options,
      url: BASE + options.url,
      header: {
        ...options.header,
        token: utils_global.globalUser.token || common_vendor.index.getStorageSync("token") || ""
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/api.js:69", "res data", res.data);
        let data;
        try {
          data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        } catch (e) {
          common_vendor.index.showToast({ title: "返回数据格式错误", icon: "none" });
          return reject(res);
        }
        common_vendor.index.__f__("log", "at utils/api.js:78", "data ==== ", data);
        if (data.code === 401) {
          common_vendor.index.__f__("log", "at utils/api.js:80", "uploadFileWithToken 重新请求");
          refreshTokenApi().then((newToken) => {
            utils_global.globalUser.token = newToken;
            common_vendor.index.setStorageSync("token", newToken);
            uploadFileWithToken(options).then(resolve).catch(reject);
          }).catch((err) => {
            common_vendor.index.showToast({ title: "token刷新失败", icon: "none" });
            reject(err);
          });
        } else if (data.code !== 0) {
          common_vendor.index.showToast({ title: data.msg || "上传失败", icon: "none" });
          reject(data);
        } else {
          resolve(data.data);
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
    url: "/api/token/refresh",
    method: "POST",
    data: {
      refreshToken: utils_global.globalUser.refreshToken || common_vendor.index.getStorageSync("refreshToken") || ""
    }
  }, true, true).then((res) => ({ token: res.token, refreshToken: res.refreshToken }));
}
function chatApi(openid, messages) {
  return requestWithToken({
    url: "/api/chat",
    method: "POST",
    data: { openid, messages }
  });
}
function imageApi(data) {
  return requestWithToken({
    url: "/api/image",
    method: "POST",
    data
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
exports.imageApi = imageApi;
exports.uploadFileWithToken = uploadFileWithToken;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
