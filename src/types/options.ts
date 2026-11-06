import VNode from 'core/vdom/vnode'
import { DebuggerEvent } from 'v3/debug'
import { SetupContext } from 'v3/apiSetup'
import { Component } from './component'

export type InternalComponentOptions = {
  _isComponent: true
  parent: Component
  _parentVnode: VNode
  render?: Function
  staticRenderFns?: Array<Function>
}

type InjectKey = string | Symbol

/**
 * @internal
 */
export type ComponentOptions = {
  // v3
  setup?: (props: Record<string, any>, ctx: SetupContext) => unknown

  [key: string]: any

  componentId?: string

  // data
  data: object | Function | void
  props?:
    | string[]
    | Record<string, Function | Array<Function> | null | PropOptions>
  propsData?: object
  computed?: {
    [key: string]:
      | Function
      | {
          get?: Function
          set?: Function
          cache?: boolean
        }
  }
  methods?: { [key: string]: Function }
  watch?: { [key: string]: Function | string }

  // DOM
  el?: string | Element
  template?: string
  render: (h: () => VNode) => VNode
  renderError?: (h: () => VNode, err: Error) => VNode
  staticRenderFns?: Array<() => VNode>

  // lifecycle
  beforeCreate?: Function
  created?: Function
  beforeMount?: Function
  mounted?: Function
  beforeUpdate?: Function
  updated?: Function
  activated?: Function
  deactivated?: Function
  beforeDestroy?: Function
  destroyed?: Function
  errorCaptured?: () => boolean | void
  serverPrefetch?: Function
  renderTracked?(e: DebuggerEvent): void
  renderTriggerd?(e: DebuggerEvent): void

  // assets
  directives?: { [key: string]: object }
  components?: { [key: string]: Component }
  transitions?: { [key: string]: object }
  filters?: { [key: string]: Function }

  // context
  provide?: Record<string | symbol, any> | (() => Record<string | symbol, any>)
  inject?:
    | { [key: string]: InjectKey | { from?: InjectKey; default?: any } }
    | Array<string>

  // component v-model customization
  model?: {
    prop?: string
    event?: string
  }

  // misc
  parent?: Component
  mixins?: Array<object>
  name?: string
  extends?: Component | object
  delimiters?: [string, string]
  comments?: boolean
  inheritAttrs?: boolean

  // Legacy API
  abstract?: any

  // private
  _isComponent?: true
  _propKeys?: Array<string>
  _parentVnode?: VNode
  _parentListeners?: object | null
  _renderChildren?: Array<VNode> | null
  _componentTag: string | null
  _scopeId: string | null
  _base: typeof Component
}

export type PropOptions = {
  type?: Function | Array<Function> | null
  default?: any
  required?: boolean | null
  validator?: Function | null
}
