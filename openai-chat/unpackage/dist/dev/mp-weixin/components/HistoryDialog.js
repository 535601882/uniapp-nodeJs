"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("../utils/api.js");
const _sfc_main = {
  __name: "HistoryDialog",
  props: { openid: String },
  setup(__props) {
    const props = __props;
    const history = common_vendor.ref([]);
    function formatTime(t) {
      if (!t)
        return "";
      const d = new Date(t);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    }
    common_vendor.onMounted(() => {
      utils_api.getHistoryApi(props.openid).then((res) => {
        history.value = res || [];
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => _ctx.$emit("close")),
        b: common_vendor.f(history.value, (item, i, i0) => {
          var _a, _b;
          return {
            a: common_vendor.t(formatTime(item.time)),
            b: common_vendor.t((_b = (_a = item.messages) == null ? void 0 : _a[item.messages.length - 1]) == null ? void 0 : _b.content),
            c: i
          };
        }),
        c: !history.value.length
      }, !history.value.length ? {} : {}, {
        d: common_vendor.o(($event) => _ctx.$emit("close"))
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9b71bd7c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/HistoryDialog.js.map
