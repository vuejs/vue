import { VNode } from './vnode'
import { Data, UnionToIntersection } from './common'
import { Vue } from './vue'

export type Slot = (...args: any[]) => VNode[]

export type Slots = Record<string, Slot | undefined>

export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>

export type EmitsOptions = ObjectEmitsOptions | string[]

export type EmitsToProps<T extends EmitsOptions> = T extends string[]
  ? {
      [K in string & `on${Capitalize<T[number]>}`]?: (...args: any[]) => any
    }
  : T extends ObjectEmitsOptions
  ? {
      [K in string &
        `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
        ? T[Uncapitalize<C>] extends null
          ? (...args: any[]) => any
          : (
              ...args: T[Uncapitalize<C>] extends (...args: infer P) => any
                ? P
                : never
            ) => any
        : never
    }
  : {}

export type EmitFn<
  Options = ObjectEmitsOptions,
  Event extends keyof Options = keyof Options,
  ReturnType extends void | Vue = void
> = Options extends Array<infer V>
  ? (event: V, ...args: any[]) => ReturnType
  : {} extends Options // if the emit is empty object (usually the default value for emit) should be converted to function
  ? (event: string, ...args: any[]) => ReturnType
  : UnionToIntersection<
      {
        [key in Event]: Options[key] extends (...args: infer Args) => any
          ? (event: key, ...args: Args) => ReturnType
          : (event: key, ...args: any[]) => ReturnType
      }[Event]
    >

export interface SetupContext<E extends EmitsOptions = {}> {
  attrs: Data
  /**
   * Equivalent of `this.$listeners`, which is Vue 2 only.
   */
  listeners: Record<string, Function | Function[]>
  slots: Slots
  emit: EmitFn<E>
  expose(exposed?: Record<string, any>): void
}
