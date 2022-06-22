import type { VNodeDirective, VNode } from './vnode'

export type DirectiveModifiers = Record<string, boolean>

export interface DirectiveBinding<V> extends Readonly<VNodeDirective> {
  readonly modifiers: DirectiveModifiers
  readonly value: V
  readonly oldValue: V | null
}

export type DirectiveHook<T = any, Prev = VNode | null, V = any> = (
  el: T,
  binding: DirectiveBinding<V>,
  vnode: VNode,
  prevVNode: Prev
) => void

export interface ObjectDirective<T = any, V = any> {
  bind?: DirectiveHook<T, any, V>
  inserted?: DirectiveHook<T, any, V>
  update?: DirectiveHook<T, any, V>
  componentUpdated?: DirectiveHook<T, any, V>
  unbind?: DirectiveHook<T, any, V>
}
export type FunctionDirective<T = any, V = any> = DirectiveHook<T, any, V>

export type Directive<T = any, V = any> =
  | ObjectDirective<T, V>
  | FunctionDirective<T, V>
