/**
Runtime helper for applying directives to a vnode. Example usage:

const comp = resolveComponent('comp')
const foo = resolveDirective('foo')
const bar = resolveDirective('bar')

return withDirectives(h(comp), [
  [foo, this.x],
  [bar, this.y]
])
*/

import { VNode } from "./vnode";
import { Data } from "./component";
import { ComponentPublicInstance } from "./componentProxy";

export interface DirectiveBinding<V = any> {
  instance: ComponentPublicInstance | null;
  value: V;
  oldValue: V | null;
  arg?: string;
  modifiers: DirectiveModifiers;
  dir: ObjectDirective<any, V>;
}

export type DirectiveHook<T = any, Prev = VNode<any, T> | null, V = any> = (
  el: T,
  binding: DirectiveBinding<V>,
  vnode: VNode<any, T>,
  prevVNode: Prev
) => void;

export type SSRDirectiveHook = (
  binding: DirectiveBinding,
  vnode: VNode
) => Data | undefined;

export interface ObjectDirective<T = any, V = any> {
  beforeMount?: DirectiveHook<T, null, V>;
  mounted?: DirectiveHook<T, null, V>;
  beforeUpdate?: DirectiveHook<T, VNode<any, T>, V>;
  updated?: DirectiveHook<T, VNode<any, T>, V>;
  beforeUnmount?: DirectiveHook<T, null, V>;
  unmounted?: DirectiveHook<T, null, V>;
  getSSRProps?: SSRDirectiveHook;
}

export type FunctionDirective<T = any, V = any> = DirectiveHook<T, any, V>;

export type Directive<T = any, V = any> =
  | ObjectDirective<T, V>
  | FunctionDirective<T, V>;

export type DirectiveModifiers = Record<string, boolean>;

export type VNodeDirectiveData = [
  unknown,
  string | undefined,
  DirectiveModifiers
];

// Directive, value, argument, modifiers
export type DirectiveArguments = Array<
  | [Directive]
  | [Directive, any]
  | [Directive, any, string]
  | [Directive, any, string, DirectiveModifiers]
>;
