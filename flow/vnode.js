declare type VNodeChildren = Array<?VNode | string | VNodeChildren> | string;

declare type VNodeComponentOptions = {
  Ctor: Class<Component>;
  propsData: ?Object;
  listeners: ?Object;
  children: ?Array<VNode>;
  tag?: string;
};

declare type MountedComponentVNode = {
  context: Component;
  componentOptions: VNodeComponentOptions;
  componentInstance: Component;
  parent: VNode;
  data: VNodeData;
};

// interface for vnodes in update modules
declare type VNodeWithData = {
  tag: string;
  data: VNodeData;
  children: ?Array<VNode>;
  text: void;
  elm: any;
  ns: string | void;
  context: Component;
  key: string | number | void;
  parent?: VNodeWithData;
  componentOptions?: VNodeComponentOptions;
  componentInstance?: Component;
  isRootInsert: boolean;
};

// vnode中的data对象，同时也是render中createElement函数中的data对象（https://cn.vuejs.org/v2/guide/render-function.html）
// 但是该结构并不是对外配置的约束，而是处理后的内部结构
declare interface VNodeData {
  //vnode对应的key配置
  key?: string | number;
  // 如果组件是其他组件的子组件，需为插槽指定名称
  slot?: string;
  //vnode对应的ref配置
  ref?: string;
  //当tag是component时候的is属性
  is?: string;
  //??????????????
  pre?: boolean;
  //vnode对应的tag
  tag?: string;
  //vnode对应的原有的class
  staticClass?: string;
  // 和`v-bind:class`一样的 API
  // 接收一个字符串、对象或字符串和对象组成的数组
  class?: any;
  //vnode对应的原有的style
  staticStyle?: { [key: string]: any };
  // 和`v-bind:style`一样的 API
  // 接收一个字符串、对象或对象组成的数组
  style?: Array<Object> | Object;
  normalizedStyle?: Object;
  // 组件 props
  props?: { [key: string]: any };
  // 正常的 HTML 特性
  attrs?: { [key: string]: string };
  //DOM 属性
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  // 事件监听器基于 `on`
  // 所以不再支持如 `v-on:keyup.enter` 修饰器
  // 需要手动匹配 keyCode。
  on?: ?{ [key: string]: Function | Array<Function> };
  // 仅对于组件，用于监听原生事件，而不是组件内部使用
  // `vm.$emit` 触发的事件。
  nativeOn?: { [key: string]: Function | Array<Function> };
  //vnode对应的transition标签的配置
  transition?: Object;
  //vnode对应的对v-show的标记
  show?: boolean; // marker for v-show
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Array<Function>;
  };
  // 自定义指令。注意，你无法对 `binding` 中的 `oldValue`
  // 赋值，因为 Vue 已经自动为你进行了同步。
  directives?: Array<VNodeDirective>;
  //vnode对应的keepAlive标签的配置
  keepAlive?: boolean;
  // 作用域插槽格式
  // { name: props => VNode | Array<VNode> }
  scopedSlots?: { [key: string]: Function };
  //vnode对应的model相关的配置
  model?: {
    value: any;
    callback: Function;
  };
};

// VNodeData中配置自定义指令的接口的结构，但是该结构并不是对外配置的约束，而是处理后的内部结构
// 自定义指令。注意，你无法对 `binding` 中的 `oldValue`
// 赋值，因为 Vue 已经自动为你进行了同步。
declare type VNodeDirective = {
  //指令名
  name: string;
  //???????
  rawName: string;
  //值 value
  value?: any;
  //???????
  oldValue?: any;
  //
  arg?: string;
  //
  modifiers?: ASTModifiers;
  //???????
  def?: Object;
};

declare type ScopedSlotsData = Array<{ key: string, fn: Function } | ScopedSlotsData>;
