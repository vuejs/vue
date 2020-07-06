import { VNode, VNodeChild } from "./vnode";
import {
  CreateComponentPublicInstance,
  ComponentPublicInstance,
} from "./componentProxy";
import {
  ComponentPropsOptions,
  NormalizedPropsOptions,
} from "./componentProps";
import { Directive } from "./directives";
import { ComponentOptions } from "./componentOptions";
import { EmitsOptions, ObjectEmitsOptions, EmitFn } from "./componentEmits";
import { InjectOptions, RenderContext } from "./options";
import { CreateElement } from "./h";

export type Data = { [key: string]: unknown };

// Note: can't mark this whole interface internal because some public interfaces
// extend it.
export interface ComponentInternalOptions {
  /**
   * @internal
   */
  __props?: NormalizedPropsOptions | [];
  /**
   * @internal
   */
  __scopeId?: string;
  /**
   * @internal
   */
  __cssModules?: Data;
  /**
   * @internal
   */
  __hmrId?: string;
  /**
   * This one should be exposed so that devtools can make use of it
   */
  __file?: string;
}

// export interface FunctionalComponent<P = {}, E extends EmitsOptions = {}>
//   extends ComponentInternalOptions {
//   // // use of any here is intentional so it can be a valid JSX Element constructor
//   // (props: P, ctx: SetupContext<E>): any;
//   // props?: ComponentPropsOptions<P>;
//   // emits?: E | (keyof E)[];
//   // inheritAttrs?: boolean;
//   // displayName?: string;
// }

export interface FunctionalComponent<Props = {}> {
  name?: string;
  props?: ComponentPropsOptions<Props>;
  model?: {
    prop?: string;
    event?: string;
  };
  inject?: InjectOptions;
  functional: boolean;
  render?(
    this: undefined,
    createElement: CreateElement,
    context: RenderContext<Props>
  ): VNode | VNode[];
}

export interface ClassComponent {
  new (...args: any[]): ComponentPublicInstance<any, any, any, any, any>;
  __vccOpts: ComponentOptions;
}

export type Component = ComponentOptions | FunctionalComponent<any>;

// A type used in public APIs where a component type is expected.
// The constructor type is an artificial type returned by defineComponent().
export type PublicAPIComponent =
  | Component
  | {
      new (...args: any[]): CreateComponentPublicInstance<
        any,
        any,
        any,
        any,
        any
      >;
    };

export { ComponentOptions };

type LifecycleHook = Function[] | null;

export const enum LifecycleHooks {
  BEFORE_CREATE = "bc",
  CREATED = "c",
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATE = "bu",
  UPDATED = "u",
  BEFORE_UNMOUNT = "bum",
  UNMOUNTED = "um",
  DEACTIVATED = "da",
  ACTIVATED = "a",
  RENDER_TRIGGERED = "rtg",
  RENDER_TRACKED = "rtc",
  ERROR_CAPTURED = "ec",
}

/**
 * @internal
 */
export type InternalRenderFunction = {
  (
    ctx: ComponentPublicInstance,
    cache: ComponentInternalInstance["renderCache"]
  ): VNodeChild;
  _rc?: boolean; // isRuntimeCompiled
};

/**
 * We expose a subset of properties on the internal instance as they are
 * useful for advanced external libraries and tools.
 */
export interface ComponentInternalInstance {
  uid: number;
  type: Component;
  parent: ComponentInternalInstance | null;
  root: ComponentInternalInstance;
  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode;
  /**
   * The pending new vnode from parent updates
   * @internal
   */
  next: VNode | null;
  /**
   * Root vnode of this component's own vdom tree
   */
  subTree: VNode;
  /**
   * The reactive effect for rendering and patching the component. Callable.
   */
  update(): void;
  /**
   * The render function that returns vdom tree.
   * @internal
   */
  render: InternalRenderFunction | null;
  /**
   * Object containing values this component provides for its descendents
   * @internal
   */
  provides: Data;
  /**
   * cache for proxy access type to avoid hasOwnProperty calls
   * @internal
   */
  accessCache: Data | null;
  /**
   * cache for render function values that rely on _ctx but won't need updates
   * after initialized (e.g. inline handlers)
   * @internal
   */
  renderCache: (Function | VNode)[];

  /**
   * Asset hashes that prototypally inherits app-level asset hashes for fast
   * resolution
   * @internal
   */
  components: Record<string, Component>;
  /**
   * @internal
   */
  directives: Record<string, Directive>;

  // the rest are only for stateful components ---------------------------------

  // main proxy that serves as the public instance (`this`)
  proxy: ComponentPublicInstance | null;

  /**
   * alternative proxy used only for runtime-compiled render functions using
   * `with` block
   * @internal
   */
  withProxy: ComponentPublicInstance | null;
  /**
   * This is the target for the public instance proxy. It also holds properties
   * injected by user options (computed, methods etc.) and user-attached
   * custom properties (via `this.x = ...`)
   * @internal
   */
  ctx: Data;

  // internal state
  data: Data;
  props: Data;
  attrs: Data;
  slots: {}; //TODO check this cr
  refs: Data;
  emit: EmitFn;

  /**
   * setup related
   * @internal
   */
  setupState: Data;

  /**
   * @internal
   */
  asyncDep: Promise<any> | null;
  /**
   * @internal
   */
  asyncResolved: boolean;

  // lifecycle
  isMounted: boolean;
  isUnmounted: boolean;
  isDeactivated: boolean;
  /**
   * @internal
   */
  [LifecycleHooks.BEFORE_CREATE]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.CREATED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.BEFORE_MOUNT]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.MOUNTED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.BEFORE_UPDATE]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.UPDATED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.BEFORE_UNMOUNT]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.UNMOUNTED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.RENDER_TRACKED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.RENDER_TRIGGERED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.ACTIVATED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.DEACTIVATED]: LifecycleHook;
  /**
   * @internal
   */
  [LifecycleHooks.ERROR_CAPTURED]: LifecycleHook;
}
