import { Vue } from "./vue";
import "./umd";

export default Vue;

export { VueConstructor } from "./vue";

export { CreateElement } from "./h";

export {
  RenderContext,
  ComputedOptions,
  WatchOptions,
} from "./componentOptions";

export { PropType } from "./componentProps";

export {
  PublicAPIComponent,
  ClassComponent,
  Component,
  ComponentOptions,
  FunctionalComponent,
} from "./component";
// export {
//   Component,
//   AsyncComponent,
//   ComponentOptions,
//   FunctionalComponentOptions,
//   RenderContext,
//   PropType,
//   PropOptions,
//   ComputedOptions,
//   WatchHandler,
//   WatchOptions,
//   WatchOptionsWithHandler,
//   DirectiveFunction,
//   DirectiveOptions
// } from "./options";

export { PluginFunction, PluginObject } from "./plugin";

export {
  VNodeChildren,
  VNodeChildrenArrayContents,
  VNode,
  VNodeComponentOptions,
  VNodeData,
  VNodeDirective,
} from "./vnode";
