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
  slots: Slots
  emit: EmitFn<E>
}
