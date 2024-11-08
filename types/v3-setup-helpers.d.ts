import { EmitFn, EmitsOptions } from './v3-setup-context'
import {
  ComponentObjectPropsOptions,
  ExtractPropTypes
} from './v3-component-props'

/**
 * Vue `<script setup>` compiler macro for declaring component props. The
 * expected argument is the same as the component `props` option.
 *
 * Example runtime declaration:
 * ```js
 * // using Array syntax
 * const props = defineProps(['foo', 'bar'])
 * // using Object syntax
 * const props = defineProps({
 *   foo: String,
 *   bar: {
 *     type: Number,
 *     required: true
 *   }
 * })
 * ```
 *
 * Equivalent type-based declaration:
 * ```ts
 * // will be compiled into equivalent runtime declarations
 * const props = defineProps<{
 *   foo?: string
 *   bar: number
 * }>()
 * ```
 *
 * This is only usable inside `<script setup>`, is compiled away in the
 * output and should **not** be actually called at runtime.
 */
// overload 1: runtime props w/ array
export function defineProps<PropNames extends string = string>(
  props: PropNames[]
): Readonly<{ [key in PropNames]?: any }>
// overload 2: runtime props w/ object
export function defineProps<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(props: PP): Readonly<ExtractPropTypes<PP>>
// overload 3: typed-based declaration
export function defineProps<TypeProps>(): DefineProps<
  TypeProps,
  BooleanKey<TypeProps>
>

type DefineProps<T, BKeys extends keyof T> = Readonly<T> & {
  readonly [K in BKeys]-?: boolean
}

type BooleanKey<T, K extends keyof T = keyof T> = K extends any
  ? [T[K]] extends [boolean | undefined]
  ? K
  : never
  : never

/**
 * Vue `<script setup>` compiler macro for declaring a component's emitted
 * events. The expected argument is the same as the component `emits` option.
 *
 * Example runtime declaration:
 * ```js
 * const emit = defineEmits(['change', 'update'])
 * ```
 *
 * Example type-based declaration:
 * ```ts
 * const emit = defineEmits<{
 *   (event: 'change'): void
 *   (event: 'update', id: number): void
 * }>()
 *
 * emit('change')
 * emit('update', 1)
 * ```
 *
 * This is only usable inside `<script setup>`, is compiled away in the
 * output and should **not** be actually called at runtime.
 */
// overload 1: runtime emits w/ array
export function defineEmits<EE extends string = string>(
  emitOptions: EE[]
): EmitFn<EE[]>
export function defineEmits<E extends EmitsOptions = EmitsOptions>(
  emitOptions: E
): EmitFn<E>
export function defineEmits<TypeEmit>(): TypeEmit

/**
 * Vue `<script setup>` compiler macro for declaring a component's exposed
 * instance properties when it is accessed by a parent component via template
 * refs.
 *
 * `<script setup>` components are closed by default - i.e. variables inside
 * the `<script setup>` scope is not exposed to parent unless explicitly exposed
 * via `defineExpose`.
 *
 * This is only usable inside `<script setup>`, is compiled away in the
 * output and should **not** be actually called at runtime.
 */
export function defineExpose<
  Exposed extends Record<string, any> = Record<string, any>
>(exposed?: Exposed): void

type NotUndefined<T> = T extends undefined ? never : T

type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}

type NativeType = null | number | string | boolean | symbol | Function

type InferDefault<P, T> =
  | ((props: P) => T & {})
  | (T extends NativeType ? T : never)

type PropsWithDefaults<
  T,
  Defaults extends InferDefaults<T>,
  BKeys extends keyof T
> = Omit<T, keyof Defaults> & {
  [K in keyof Defaults]-?: K extends keyof T
  ? Defaults[K] extends undefined
  ? T[K]
  : NotUndefined<T[K]>
  : never
} & { readonly [K in BKeys]-?: boolean }

/**
 * Vue `<script setup>` compiler macro for providing props default values when
 * using type-based `defineProps` declaration.
 *
 * Example usage:
 * ```ts
 * withDefaults(defineProps<{
 *   size?: number
 *   labels?: string[]
 * }>(), {
 *   size: 3,
 *   labels: () => ['default label']
 * })
 * ```
 *
 * This is only usable inside `<script setup>`, is compiled away in the output
 * and should **not** be actually called at runtime.
 */
export function withDefaults<
  T,
  BKeys extends keyof T,
  Defaults extends InferDefaults<T>
>(
  props: DefineProps<T, BKeys>,
  defaults: Defaults
): PropsWithDefaults<T, Defaults, BKeys>

// make them global
type _defineProps = typeof defineProps
type _defineEmits = typeof defineEmits
type _defineExpose = typeof defineExpose
type _withDefaults = typeof withDefaults

declare global {
  const defineProps: _defineProps
  const defineEmits: _defineEmits
  const defineExpose: _defineExpose
  const withDefaults: _withDefaults
}
