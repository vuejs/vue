// global flag to be compiled away
declare var __WEEX__: boolean;

declare type Weex = {
  config: Object;
  document: WeexDocument;
  requireModule: (name: string) => Object | void;
  supports: (condition: string) => boolean | void;
  isRegisteredModule: (name: string, method?: string) => boolean;
  isRegisteredComponent: (name: string) => boolean;
};

declare interface WeexDocument {
  id: string | number;
  URL: string;
  taskCenter: Object;

  open: () => void;
  close: () => void;
  createElement: (tagName: string, props?: Object) => WeexElement;
  createComment: (text: string) => Object;
  fireEvent: (type: string) => void;
  destroy: () => void;
};

declare interface WeexElement {
  nodeType: number;
  nodeId: string | number;
  type: string;
  ref: string | number;
  text?: string;

  parentNode: WeexElement | void;
  children: Array<WeexElement>;
  previousSibling: WeexElement | void;
  nextSibling: WeexElement | void;

  appendChild: (node: WeexElement) => void;
  removeChild: (node: WeexElement, preserved?: boolean) => void;
  insertBefore: (node: WeexElement, before: WeexElement) => void;
  insertAfter: (node: WeexElement, after: WeexElement) => void;
  setAttr: (key: string, value: any, silent?: boolean) => void;
  setAttrs: (attrs: Object, silent?: boolean) => void;
  setStyle: (key: string, value: any, silent?: boolean) => void;
  setStyles: (attrs: Object, silent?: boolean) => void;
  addEvent: (type: string, handler: Function, args?: Array<any>) => void;
  removeEvent: (type: string) => void;
  fireEvent: (type: string) => void;
  destroy: () => void;
}

declare type WeexInstanceOption = {
  instanceId: string;
  config: Object;
  document: WeexDocument;
  Vue?: GlobalAPI;
  app?: Component;
  data?: Object;
};

declare type WeexRuntimeContext = {
  weex: Weex;
  service: Object;
  BroadcastChannel?: Function;
};

declare type WeexInstanceContext = {
  Vue: GlobalAPI;

  // DEPRECATED
  setTimeout?: Function;
  clearTimeout?: Function;
  setInterval?: Function;
  clearInterval?: Function;
};

declare type WeexCompilerOptions = CompilerOptions & {
  // whether to compile special template for <recycle-list>
  recyclable?: boolean;
};

declare type WeexCompiledResult = CompiledResult & {
  '@render'?: string;
};
