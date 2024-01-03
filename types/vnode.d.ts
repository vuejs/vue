import { StyleValue } from './jsx'
import { Vue } from './vue'
import { DirectiveFunction, DirectiveOptions } from './options'
import { Ref } from './v3-generated'
import { ComponentPublicInstance } from './v3-component-public-instance'

/**
 * For extending allowed non-declared props on components in TSX
 */
export interface ComponentCustomProps {}

/**
 * Default allowed non-declared props on component in TSX
 */
export interface AllowedComponentProps {
  class?: unknown
  style?: unknown
}

export type ScopedSlot = (props: any) => ScopedSlotReturnValue
type ScopedSlotReturnValue =
  | VNode
  | string
  | boolean
  | number
  | null
  | undefined
  | ScopedSlotReturnArray
interface ScopedSlotReturnArray extends Array<ScopedSlotReturnValue> {}

// Scoped slots are guaranteed to return Array of VNodes starting in 2.6
export type NormalizedScopedSlot = (props: any) => ScopedSlotChildren
export type ScopedSlotChildren = VNode[] | undefined

// Relaxed type compatible with $createElement
export type VNodeChildren =
  | VNodeChildrenArrayContents
  | [ScopedSlot]
  | string
  | boolean
  | number
  | null
  | undefined
export interface VNodeChildrenArrayContents
  extends Array<VNodeChildren | VNode> {}

export interface VNode {
  tag?: string
  data?: VNodeData
  children?: VNode[]
  text?: string
  elm?: Node
  ns?: string
  context?: Vue
  key?: string | number | symbol | boolean
  componentOptions?: VNodeComponentOptions
  componentInstance?: Vue
  parent?: VNode
  raw?: boolean
  isStatic?: boolean
  isRootInsert: boolean
  isComment: boolean
}

export interface VNodeComponentOptions {
  Ctor: typeof Vue
  propsData?: object
  listeners?: object
  children?: VNode[]
  tag?: string
}

export type VNodeRef =
  | string
  | Ref
  | ((
      ref: Element | ComponentPublicInstance | null,
      refs: Record<string, any>
    ) => void)

export interface VNodeData {
  key?: string | number
  slot?: string
  scopedSlots?: { [key: string]: ScopedSlot | undefined }
  ref?: VNodeRef
  refInFor?: boolean
  tag?: string
  staticClass?: string
  class?: any
  staticStyle?: { [key: string]: any }
  style?: StyleValue
  props?: { [key: string]: any }
  attrs?: { [key: string]: any }
  domProps?: { [key: string]: any }
  hook?: { [key: string]: Function }
  on?: { [key: string]: Function | Function[] }
  nativeOn?: { [key: string]: Function | Function[] }
  transition?: object
  show?: boolean
  inlineTemplate?: {
    render: Function
    staticRenderFns: Function[]
  }
  directives?: VNodeDirective[]
  keepAlive?: boolean
}

export interface VNodeDirective {
  name: string
  value?: any
  oldValue?: any
  expression?: string
  arg?: string
  oldArg?: string
  modifiers?: { [key: string]: boolean }
  def?: DirectiveFunction | DirectiveOptions
}
