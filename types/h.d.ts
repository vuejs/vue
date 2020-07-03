// `h` is a more user-friendly version of `createVNode` that allows omitting the
// props when possible. It is intended for manually written render functions.
// Compiler-generated code uses `createVNode` because
// 1. it is monomorphic and avoids the extra call overhead
// 2. it allows specifying patchFlags for optimization

import { VNode, VNodeChildrenArrayContents, VNodeChildren } from "./vnode";
import { EmitsOptions } from "./componentEmits";
import { FunctionalComponent, Component } from "./component";

/*
// type only
h('div')

// type + props
h('div', {})

// type + omit props + children
// Omit props does NOT support named slots
h('div', []) // array
h('div', 'foo') // text
h('div', h('br')) // vnode
h(Component, () => {}) // default slot

// type + props + children
h('div', {}, []) // array
h('div', {}, 'foo') // text
h('div', {}, h('br')) // vnode
h(Component, {}, () => {}) // default slot
h(Component, {}, {}) // named slots

// named slots without props requires explicit `null` to avoid ambiguity
h(Component, null, {})
**/

// fake constructor type returned from `defineComponent`
interface Constructor<P = any> {
  new (): { $props: P };
}

type RawProps = Record<string, any> & {
//   // used to differ from a single VNode object as children
//   __v_isVNode?: never;
  // used to differ from Array children
  [Symbol.iterator]?: never;
};

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeChildren
  | (() => any);

// The following is a series of overloads for providing props validation of
// manually written render functions.

// element
export declare function h(type: string, children?: RawChildren): VNode;
export declare function h(
  type: string,
  props?: RawProps | null,
  children?: RawChildren //| RawSlots
): VNode;

// functional component
export declare function h<P, E extends EmitsOptions = {}>(
  type: FunctionalComponent<P>,
  props?: (RawProps & P) | ({} extends P ? null : never),
  children?: RawChildren //| RawSlots
): VNode;

// catch-all for generic component types
export declare function h(type: Component, children?: RawChildren): VNode;

// fake constructor type returned by `defineComponent` or class component
export declare function h(type: Constructor, children?: RawChildren): VNode;
export declare function h<P>(
  type: Constructor<P>,
  props?: (RawProps & P) | ({} extends P ? null : never),
  children?: RawChildren //| RawSlots
): VNode;
