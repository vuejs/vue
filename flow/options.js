declare type InternalComponentOptions = {
  //用于标记options是InternalComponentOptions还是一个一般的options。使用InternalComponentOptions创建component实例要比普通的option效率高，普通的option需要进行处理才能转换为InternalComponentOptions
  _isComponent: true;
  parent: Component;
  propsData: ?Object;
  _parentVnode: VNode;
  _parentListeners: ?Object;
  _renderChildren: ?Array<VNode>;
  _componentTag: ?string;
  _parentElm: ?Node;
  _refElm: ?Node;
  render?: Function;
  staticRenderFns?: Array<Function>
};

type InjectKey = string | Symbol;

declare type ComponentOptions = {
  // data
  data: Object | Function | void;
  props?: { [key: string]: PropOptions };
  propsData?: ?Object;
  computed?: {
    [key: string]: Function | {
      get?: Function;
      set?: Function;
      cache?: boolean
    }
  };
  methods?: { [key: string]: Function };
  watch?: { [key: string]: Function | string };

  // DOM
  el?: string | Element;
  template?: string;
  render: (h: () => VNode) => VNode;
  renderError?: (h: () => VNode, err: Error) => VNode;
  staticRenderFns?: Array<() => VNode>;

  // lifecycle
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
  directives?: { [key: string]: Object };
  components?: { [key: string]: Class<Component> };
  transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  // context
  provide?: { [key: string | Symbol]: any } | () => { [key: string | Symbol]: any };
  inject?: { [key: string]: InjectKey | { from?: InjectKey, default?: any }} | Array<string>;

  // component v-model customization
  model?: {
    prop?: string;
    event?: string;
  };

  // misc
  parent?: Component;
  mixins?: Array<Object>;
  name?: string;
  extends?: Class<Component> | Object;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;

  // private
  //用于标记options是InternalComponentOptions还是一个一般的options。使用InternalComponentOptions创建component实例要比普通的option效率高，普通的option需要进行处理才能转换为InternalComponentOptions。例如普通的options必须配置template或者render的任意一项，如果配了template，会被编译成render；而InternalComponentOptions必须配置render，不可用配置template
  _isComponent?: true;
  //将propsOption的props名字以数组的形式保存起来，如props:{name: {type: String, default: ''}}，则_propKeys值为['name']。这样便于后续快速遍历props的名字 C
  _propKeys?: Array<string>;
  //父节点的vnode对象，具体做什么？？？？？？？？？？
  _parentVnode?: VNode;
  //父节点的listener对象，具体做什么？？？？？？？？？？
  _parentListeners?: ?Object;
  //render模块渲染时候使用，具体做什么？？？？？？？？？？？
  _renderChildren?: ?Array<VNode>;
  //模块的标签名
  _componentTag: ?string;
  //????????????
  _scopeId: ?string;
  //初始化自己的vue，如果window上存在多个版本的vue，使用_base可以知道是哪个版本的vue初始化的自己
  _base: Class<Component>;
  //父控件的dom节点？？？？？？？？？？？？？？
  _parentElm: ?Node;
  //当前的控件实例的node节点
  _refElm: ?Node;
};

declare type PropOptions = {
  type: Function | Array<Function> | null;
  default: any;
  required: ?boolean;
  validator: ?Function;
}
