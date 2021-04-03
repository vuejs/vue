import VNode from "../src/core/vdom/vnode";
import { Component } from "./component";

declare type InternalComponentOptions = {
  _isComponent: true;
  parent: Component;
  _parentVnode: VNode;
  render?: Function;
  staticRenderFns?: Array<Function>;
};

type InjectKey = string | Symbol;

declare type ComponentOptions = {
  componentId?: string;

  // data
  data: object | Function | void;
  props?: { [key: string]: PropOptions };
  propsData?: object;
  computed?: {
    [key: string]:
      | Function
      | {
          get?: Function;
          set?: Function;
          cache?: boolean;
        };
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
  serverPrefetch?: Function;

  // assets
  directives?: { [key: string]: object };
  components?: { [key: string]: Component };
  transitions?: { [key: string]: object };
  filters?: { [key: string]: Function };

  // context
  provide?: Record<string | symbol, any> | (() => Record<string | symbol, any>);
  inject?:
    | { [key: string]: InjectKey | { from?: InjectKey; default?: any } }
    | Array<string>;

  // component v-model customization
  model?: {
    prop?: string;
    event?: string;
  };

  // misc
  parent?: Component;
  mixins?: Array<object>;
  name?: string;
  extends?: Component | object;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;

  // private
  _isComponent?: true;
  _propKeys?: Array<string>;
  _parentVnode?: VNode;
  _parentListeners?: object | null;
  _renderChildren?: Array<VNode> | null;
  _componentTag: string | null;
  _scopeId: string | null;
  _base: Component;
};

declare type PropOptions = {
  type: Function | Array<Function> | null;
  default: any;
  required: boolean | null;
  validator: Function | null;
};
