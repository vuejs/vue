declare type VNodeChildren = Array<any> | () => Array<any> | string

declare type VNodeComponentOptions = {
  Ctor: Class<Component>,
  propsData: ?Object,
  listeners: ?Object,
  parent: Component,
  children: ?VNodeChildren
}

declare interface MountedComponentVNode {
  componentOptions: VNodeComponentOptions;
  child: Component;
}

// interface for vnodes in update modules
declare interface VNodeWithData {
  tag: string;
  data: VNodeData;
  children: Array<VNode> | void;
  text: void;
  elm: Node;
  ns: string | void;
  context: Component;
  key: string | number | void;
}

declare interface VNodeData {
  pre?: true;
  key?: string | number;
  slot?: string;
  staticClass?: string;
  class?: any;
  style?: Array<Object> | Object;
  show?: true;
  props?: { [key: string]: any };
  attrs?: { [key: string]: string };
  staticAttrs?: { [key: string]: string };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Array<Function> };
  transition?: {
    definition: String | Object,
    appear: boolean
  };
  inlineTemplate?: {
    render: Function,
    staticRenderFns: Array<Function>
  };
  directives?: Array<{
    name: string,
    value?: any,
    arg?: string,
    modifiers?: { [key: string]: boolean }
  }>;
}
