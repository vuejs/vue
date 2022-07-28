// 导入Vue
import Vue from "./instance/index";
import { initGlobalAPI } from "./global-api/index";
import { isServerRendering } from "core/util/env";
import { FunctionalRenderContext } from "core/vdom/create-functional-component";

// 将Vue构造函数作为参数，传递给initGlobalAPI方法，该方法来自 ./global-api/index.js文件
initGlobalAPI(Vue);

// 在Vue.prototype上添加$isServer属性，该属性“代理”了来自 core/util/env.js文件的isServerRendering方法
Object.defineProperty(Vue.prototype, "$isServer", {
  get: isServerRendering,
});

// 在 Vue.prototype 上添加 $ssrContext 属性
Object.defineProperty(Vue.prototype, "$ssrContext", {
  get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext;
  },
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, "FunctionalRenderContext", {
  value: FunctionalRenderContext,
});

// Vue.version存储了当前Vue的版本号
Vue.version = "__VERSION__";

// 导出Vue
export default Vue;
