declare type InternalComponentOptions = {
  _isComponent: true;
  parent: Component;
  _parentVnode: VNode;
  _parentElm: ?Node;
  _refElm: ?Node;
  render?: Function;
  staticRenderFns?: Array<Function>
};

type InjectKey = string | Symbol;

declare type ComponentOptions = {
  componentId?: string;                                  // 组件ID

  // data
  data: Object | Function | void;                        // 双向绑定的数据（组件内部提供）
  props?: { [key: string]: PropOptions };                // 由父组件传递的数据
  propsData?: ?Object;                                   // 创建实例时传递 props
  computed?: {                                           // 实例下的计算属性
    [key: string]: Function | {
      get?: Function;
      set?: Function;
      cache?: boolean
    }
  };
  methods?: { [key: string]: Function };                 // 实例下的方法
  watch?: { [key: string]: Function | string };          // 实例下的watcher

  // DOM
  el?: string | Element;                                 // 实例绑定的 DOM 节点
  template?: string;                                     // 实例对应的模板
  render: (h: () => VNode) => VNode;                     // 实例对应的渲染函数
  renderError?: (h: () => VNode, err: Error) => VNode;   // 渲染函数出错的处理
  staticRenderFns?: Array<() => VNode>;                  // TODO 和渲染函数一起出现，作用未知

  // lifecycle                                           // 一些钩子，在特定的生命周期触发时调用
  beforeCreate?: Function;
  created?: Function;
  beforeMount?: Function;
  mounted?: Function;
  beforeUpdate?: Function;
  updated?: Function;
  activated?: Function;
  deactivated?: Function;
  beforeDestroy?: Function;
  destroyed?: Function;
  errorCaptured?: () => boolean | void;

  // assets
  directives?: { [key: string]: Object };                // 实例绑定的指令
  components?: { [key: string]: Class<Component> };      // 实例下的组件
  transitions?: { [key: string]: Object };               // TODO 和过渡效果相关，作用未知
  filters?: { [key: string]: Function };                 // 实例下的过滤器

  // context
  provide?: { [key: string | Symbol]: any } | () => { [key: string | Symbol]: any };              // 一些树结构顶端的配置数据提供者
  inject?: { [key: string]: InjectKey | { from?: InjectKey, default?: any }} | Array<string>;     // 配置数据的接受者

  // component v-model customization                     // v-model 的定制化字段
  model?: {
    prop?: string;
    event?: string;
  };

  // misc
  parent?: Component;                                    // 保存父组件
  mixins?: Array<Object>;                                // 混入选项
  name?: string;                                         // 实例名字
  extends?: Class<Component> | Object;                   // 需要继承的实例
  delimiters?: [string, string];                         // 改变纯文本插入分隔符
  comments?: boolean;                                    // 是否保留注释
  inheritAttrs?: boolean;                                // HTML 标签中的属性是否过渡到子实例上

  // private
  _isComponent?: true;                                   // 判断当前实例是否是组件
  _propKeys?: Array<string>;                             // key 用于 DOM 生成优化，还有动画
  _parentVnode?: VNode;                                  // 父节点，仅仅是 vnode 对象，不是 vue 实例
  _parentListeners?: ?Object;                            // 父组件上的监听函数
  _renderChildren?: ?Array<VNode>;
  _componentTag: ?string;                                // 组件对应真实 DOM 的标签
  _scopeId: ?string;                                     // TODO 未知使用情况
  _base: Class<Component>;                               // 用于保存当前 Vue 类
  _parentElm: ?Node;                                     // TODO 未知
  _refElm: ?Node;                                        // TODO 应该与 ref 使用有关
};

declare type PropOptions = {
  type: Function | Array<Function> | null;
  default: any;
  required: ?boolean;
  validator: ?Function;
}
