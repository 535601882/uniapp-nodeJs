"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("../utils/api.js");
const _sfc_main = {
  __name: "ImageGenView",
  setup(__props) {
    const prompt = common_vendor.ref("");
    const n = common_vendor.ref(1);
    function onSliderChange(e) {
      n.value = e.detail.value;
    }
    const size = common_vendor.ref("1024x1024");
    function onRadioChange(e) {
      size.value = e.detail.value;
    }
    const sizes = ["1024x1024", "1536x1024", "1024x1536"];
    const loading = common_vendor.ref(false);
    const uploadImages = common_vendor.ref([]);
    const genImages = common_vendor.ref([]);
    const progress = common_vendor.ref(0);
    const statusText = common_vendor.ref("");
    const uploadLoading = common_vendor.ref(false);
    function chooseAndUploadImage() {
      const max = 10 - uploadImages.value.length;
      if (max <= 0)
        return;
      common_vendor.index.chooseImage({
        count: max,
        success: (chooseRes) => {
          const filePaths = chooseRes.tempFilePaths;
          uploadLoading.value = true;
          let finished = 0;
          filePaths.forEach((filePath) => {
            utils_api.uploadFileWithToken({
              url: "/api/image/upload",
              filePath,
              name: "image"
            }).then((res) => {
              uploadImages.value.push(res.url);
              common_vendor.index.showToast({ title: "上传成功", icon: "success" });
            }).catch((e) => {
              common_vendor.index.showToast({ title: "上传失败", icon: "none" });
            }).finally(() => {
              finished++;
              if (finished === filePaths.length) {
                uploadLoading.value = false;
              }
            });
          });
        }
      });
    }
    function removeImage(idx) {
      uploadImages.value.splice(idx, 1);
    }
    function genImageStream() {
      if (!prompt.value.trim()) {
        common_vendor.index.showToast({ title: "请输入描述", icon: "none" });
        return;
      }
      loading.value = true;
      progress.value = 0;
      genImages.value = [];
      utils_api.imageApi({
        prompt: prompt.value,
        n: n.value,
        size: size.value,
        images: uploadImages.value
      }).then((data) => {
        common_vendor.index.__f__("log", "at components/ImageGenView.vue:114", "data", data);
        loading.value = false;
        if (data && data.download_links) {
          genImages.value = data.download_links;
        }
      }).catch((err) => {
        loading.value = false;
        statusText.value = err && err.msg ? err.msg : "生成失败";
      });
    }
    function preview(img, type = "upload") {
      if (type === "upload") {
        common_vendor.index.previewImage({ urls: uploadImages.value, current: img });
      } else {
        common_vendor.index.previewImage({ urls: genImages.value, current: img });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: prompt.value,
        b: common_vendor.o(($event) => prompt.value = $event.detail.value),
        c: n.value,
        d: common_vendor.o(onSliderChange),
        e: common_vendor.t(n.value),
        f: common_vendor.f(sizes, (s, k0, i0) => {
          return {
            a: common_vendor.t(s),
            b: s,
            c: size.value === s,
            d: common_vendor.o(($event) => onRadioChange({
              detail: {
                value: s
              }
            }), s),
            e: s
          };
        }),
        g: common_vendor.f(uploadImages.value, (img, i, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => preview(img, "upload"), i),
            c: common_vendor.o(($event) => removeImage(i), i),
            d: i
          };
        }),
        h: uploadImages.value.length < 10
      }, uploadImages.value.length < 10 ? common_vendor.e({
        i: !uploadLoading.value
      }, !uploadLoading.value ? {} : {}, {
        j: common_vendor.o(chooseAndUploadImage)
      }) : {}, {
        k: common_vendor.o(genImageStream),
        l: loading.value,
        m: genImages.value.length
      }, genImages.value.length ? {
        n: common_vendor.f(genImages.value, (img, i, i0) => {
          return {
            a: i,
            b: img,
            c: common_vendor.o(($event) => preview(img, "gen"), i)
          };
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-22e8784c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ImageGenView.js.map
