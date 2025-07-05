"use strict";
const common_vendor = require("../common/vendor.js");
const utils_global = require("../utils/global.js");
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
    const images = common_vendor.ref([]);
    const progress = common_vendor.ref(0);
    const statusText = common_vendor.ref("");
    function genImageStream() {
      if (!prompt.value.trim()) {
        common_vendor.index.showToast({ title: "请输入描述", icon: "none" });
        return;
      }
      loading.value = true;
      images.value = [];
      progress.value = 0;
      statusText.value = "生成中...";
      common_vendor.index.request({
        url: "http://localhost:3000/api/image",
        method: "POST",
        data: {
          prompt: prompt.value,
          n: n.value,
          size: size.value
        },
        header: {
          "Content-Type": "application/json",
          token: utils_global.globalUser.token || common_vendor.index.getStorageSync("token") || ""
        },
        success: (res) => {
          loading.value = false;
          if (res.data && res.data.code === 0 && res.data.data && res.data.data.download_links) {
            images.value = res.data.data.download_links;
            statusText.value = "生成完成";
          } else {
            statusText.value = res.data.msg || "生成失败";
          }
        },
        fail: () => {
          loading.value = false;
          statusText.value = "生成失败";
        }
      });
    }
    function preview(img) {
      common_vendor.index.previewImage({ urls: images.value, current: img });
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
        g: common_vendor.o(genImageStream),
        h: loading.value,
        i: loading.value
      }, loading.value ? {
        j: common_vendor.t(statusText.value),
        k: progress.value
      } : {}, {
        l: images.value.length
      }, images.value.length ? {
        m: common_vendor.f(images.value, (img, i, i0) => {
          return {
            a: i,
            b: img,
            c: common_vendor.o(($event) => preview(img), i)
          };
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-22e8784c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/ImageGenView.js.map
