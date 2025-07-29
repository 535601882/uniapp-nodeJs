"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const prompt = common_vendor.ref("");
    const uploadImages = common_vendor.ref([]);
    const resultImage = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const chooseAndUploadImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "上传中..." });
          utils_api.uploadFileWithToken({
            url: "/api/image/upload",
            filePath,
            name: "image"
          }).then((uploadRes) => {
            uploadImages.value.push(uploadRes.url);
            common_vendor.index.hideLoading();
          }).catch((err) => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "上传失败", icon: "none" });
          });
        }
      });
    };
    const removeImage = (index) => {
      uploadImages.value.splice(index, 1);
    };
    const generateImage = async () => {
      if (!prompt.value.trim() && uploadImages.value.length === 0) {
        common_vendor.index.showToast({ title: "请输入描述或上传图片", icon: "none" });
        return;
      }
      loading.value = true;
      resultImage.value = null;
      try {
        const res = await utils_api.imageApi.generate({
          prompt: prompt.value,
          images: uploadImages.value,
          n: 1,
          size: "1024x1024"
          // 简化示例
        });
        if (res.download_links && res.download_links.length > 0) {
          resultImage.value = res.download_links[0];
        } else {
          const content = res.choices[0].message.content;
          const urlMatch = content.match(/https?:\/\/[^\s)]+\.png/);
          if (urlMatch) {
            resultImage.value = urlMatch[0];
          } else {
            common_vendor.index.showToast({ title: "响应中未找到图片URL", icon: "none" });
          }
        }
      } catch (error) {
        common_vendor.index.showToast({ title: error.msg || "生成失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const previewResult = () => {
      if (resultImage.value) {
        common_vendor.index.previewImage({ urls: [resultImage.value] });
      }
    };
    const saveImage = () => {
      if (!resultImage.value) {
        common_vendor.index.showToast({ title: "没有可保存的图片", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "保存中..." });
      common_vendor.index.downloadFile({
        url: resultImage.value,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "保存成功", icon: "success" });
              },
              fail: (err) => {
                common_vendor.index.hideLoading();
                if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                  common_vendor.index.showModal({
                    title: "提示",
                    content: "请授权保存图片到相册",
                    showCancel: false,
                    success: () => {
                      common_vendor.index.openSetting();
                    }
                  });
                } else {
                  common_vendor.index.showToast({ title: "保存失败", icon: "none" });
                }
              }
            });
          } else {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "图片下载失败", icon: "none" });
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "图片下载失败", icon: "none" });
        }
      });
    };
    common_vendor.onShareAppMessage((res) => {
      if (res.from === "button") {
        common_vendor.index.__f__("log", "at pages/index/index.vue:172", "分享按钮点击", res.target);
      }
      return {
        title: "快来体验AI创作，生成你的专属图片！",
        // 分享标题
        path: "/pages/index/index",
        imageUrl: resultImage.value || "/static/logo.png"
      };
    });
    common_vendor.onShareTimeline(() => {
      return {
        title: "AI创作，一键生成惊艳图片！",
        query: "from=timeline",
        imageUrl: resultImage.value || "/static/logo.png"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: prompt.value,
        c: common_vendor.o(($event) => prompt.value = $event.detail.value),
        d: common_vendor.f(uploadImages.value, (img, i, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => removeImage(i), i),
            c: i
          };
        }),
        e: uploadImages.value.length < 1
      }, uploadImages.value.length < 1 ? {
        f: common_vendor.o(chooseAndUploadImage)
      } : {}, {
        g: common_vendor.o(generateImage),
        h: loading.value,
        i: resultImage.value
      }, resultImage.value ? {
        j: resultImage.value,
        k: common_vendor.o(previewResult),
        l: common_vendor.o(saveImage)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
