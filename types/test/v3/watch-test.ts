import { ref, computed, watch, shallowRef } from '../../index'
import { expectType } from '../utils'

const source = ref('foo')
const source2 = computed(() => source.value)
const source3 = () => 1

// lazy watcher will have consistent types for oldValue.
watch(source, (value, oldValue) => {
  expectType<string>(value)
  expectType<string>(oldValue)
})

watch([source, source2, source3], (values, oldValues) => {
  expectType<[string, string, number]>(values)
  expectType<[string, string, number]>(oldValues)
})

// const array
watch([source, source2, source3] as const, (values, oldValues) => {
  expectType<Readonly<[string, string, number]>>(values)
  expectType<Readonly<[string, string, number]>>(oldValues)
})

// immediate watcher's oldValue will be undefined on first run.
watch(
  source,
  (value, oldValue) => {
    expectType<string>(value)
    expectType<string | undefined>(oldValue)
  },
  { immediate: true }
)

watch(
  [source, source2, source3],
  (values, oldValues) => {
    expectType<[string, string, number]>(values)
    expectType<[string | undefined, string | undefined, number | undefined]>(
      oldValues
    )
  },
  { immediate: true }
)

// const array
watch(
  [source, source2, source3] as const,
  (values, oldValues) => {
    expectType<Readonly<[string, string, number]>>(values)
    expectType<
      Readonly<[string | undefined, string | undefined, number | undefined]>
    >(oldValues)
  },
  { immediate: true }
)

// should provide correct ref.value inner type to callbacks
const nestedRefSource = ref({
  foo: ref(1)
})

watch(nestedRefSource, (v, ov) => {
  expectType<{ foo: number }>(v)
  expectType<{ foo: number }>(ov)
})

const someRef = ref({ test: 'test' })
const otherRef = ref({ a: 'b' })
watch([someRef, otherRef], values => {
  const value1 = values[0]
  // no type error
  console.log(value1.test)

  const value2 = values[1]
  // no type error
  console.log(value2.a)
})

{
  //#12978
  type Steps = { step: '1' } | { step: '2' }
  const shallowUnionGenParam = shallowRef<Steps>({ step: '1' })
  const shallowUnionAsCast = shallowRef({ step: '1' } as Steps)

  watch(shallowUnionGenParam, value => {
    expectType<Steps>(value)
  })
  watch(shallowUnionAsCast, value => {
    expectType<Steps>(value)
  })
}