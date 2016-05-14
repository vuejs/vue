declare type ComponentOptions = {
  // data
  data: Object | Function | void,
  props?: { [key: string]: PropOptions },
  propsData?: Object,
  computed?: {
    [key: string]: Function | {
      get?: Function,
      set?: Function,
      cache?: boolean
    }
  },
  methods?: {
    [key: string]: Function
  },
  watch?: {
    [key: string]: Function | string
  },
  // DOM
  el?: string | Element,
  template?: string,
  render: () => VNode,
  staticRenderFns?: Array<() => VNode>,
  // lifecycle
  init?: Function,
  created?: Function,
  beforeMount?: Function,
  mounted?: Function,
  beforeUpdate?: Function,
  updated?: Function,
  // assets
  directives?: { [key: string]: Object },
  components?: { [key: string]: Class<Component> },
  transitions?: { [key: string]: Object },
  filters?: { [key: string]: Function },
  // misc
  parent?: Component,
  mixins?: Array<Object>,
  name?: string,
  extends?: Class<Component> | Object,
  delimiters?: [string, string],

  // private
  _propKeys?: Array<string>,
  _parentVnode?: VNode,
  _parentListeners?: ?{ [key: string]: Function | Array<Function> },
  _renderChildren?: ?VNodeChildren
}

declare type PropOptions = {
  type: Function | Array<Function> | null,
  default: any,
  required: ?boolean,
  validator: ?Function
}
