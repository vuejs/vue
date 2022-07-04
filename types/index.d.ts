import { Vue } from './vue'
import './umd'
import './jsx'

export default Vue

export { CreateElement, VueConstructor } from './vue'

export {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  RenderContext,
  PropType,
  PropOptions,
  ComputedOptions,
  WatchHandler,
  WatchOptions,
  WatchOptionsWithHandler,
  DirectiveFunction,
  DirectiveOptions
} from './options'

export { PluginFunction, PluginObject } from './plugin'

export {
  VNodeChildren,
  VNodeChildrenArrayContents,
  VNode,
  VNodeComponentOptions,
  VNodeData,
  VNodeDirective,
  ComponentCustomProps
} from './vnode'

export * from './v3-manual-apis'
export * from './v3-generated'
// <script setup> helpers
export * from './v3-setup-helpers'

export { Data } from './common'
export { SetupContext } from './v3-setup-context'
export { defineComponent } from './v3-define-component'
// export { defineAsyncComponent } from './defineAsyncComponent'
export {
  SetupFunction,
  // v2 already has option with same name and it's for a single computed
  ComputedOptions as ComponentComputedOptions,
  MethodOptions as ComponentMethodOptions,
  ComponentPropsOptions,
  ComponentCustomOptions
} from './v3-component-options'
export {
  ComponentInstance,
  ComponentPublicInstance,
  CreateComponentPublicInstance,
  ComponentCustomProperties
} from './v3-component-public-instance'
export {
  // PropType,
  // PropOptions,
  ExtractPropTypes,
  ExtractDefaultPropTypes
} from './v3-component-props'
export {
  DirectiveModifiers,
  DirectiveBinding,
  DirectiveHook,
  ObjectDirective,
  FunctionDirective,
  Directive
} from './v3-directive'
