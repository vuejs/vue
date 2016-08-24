import { Vue } from "./vue.d";

export type VNodeChildren = VNodeChildrenArrayContents | string;
export interface VNodeChildrenArrayContents {
  [x: number]: VNode | string | VNodeChildren;
}

export interface VNode {
  tag?: string;
  data?: VNodeData;
  children?: VNode[];
  text?: string;
  elm?: Node;
  ns?: string;
  context?: Vue;
  key?: string | number;
  componentOptions?: VNodeComponentOptions;
  child?: Vue;
  parent?: VNode;
  raw?: boolean;
  isStatic?: boolean;
  isRootInsert: boolean;
  isComment: boolean;
}

export interface VNodeComponentOptions {
  Ctor: Vue;
  propsData?: Object;
  listeners?: Object;
  children?: VNodeChildren;
  tag?: string;
}

export interface VNodeData {
  key?: string | number;
  slot?: string;
  ref?: string;
  tag?: string;
  staticClass?: string;
  class?: any;
  style?: Object[] | Object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: any };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Function[] };
  nativeOn?: { [key: string]: Function | Function[] };
  transition?: Object;
  transitionInjected?: boolean;
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Function[];
  };
  directives?: VNodeDirective[];
  keepAlive?: boolean;
}

export interface VNodeDirective {
  name: string;
  value: any;
  oldValue: any;
  expression: any;
  arg: string;
  modifiers: { [key: string]: boolean };
}
