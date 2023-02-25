import { VNode, defineComponent, ref, RenderContext } from '../../index'
import { expectType } from '../utils'

expectType<VNode>(<div />)
expectType<JSX.Element>(<div />)
expectType<JSX.Element>(<div id="foo" />)
expectType<JSX.Element>(<input value="foo" />)

// @ts-expect-error style css property validation
expectError(<div style={{ unknown: 123 }} />)

// allow array styles and nested array styles
expectType<JSX.Element>(<div style={[{ color: 'red' }]} />)
expectType<JSX.Element>(
  <div style={[{ color: 'red' }, [{ fontSize: '1em' }]]} />
)

// @ts-expect-error unknown prop
expectError(<div foo="bar" />)

// allow key/ref on arbitrary element
expectType<JSX.Element>(<div key="foo" />)
expectType<JSX.Element>(<div ref="bar" />)

// allow Ref type type on arbitrary element
const fooRef = ref<HTMLElement>()
expectType<JSX.Element>(<div ref={fooRef} />)
expectType<JSX.Element>(
  <div
    ref={el => {
      fooRef.value = el as HTMLElement
    }}
  />
)

expectType<JSX.Element>(
  <input
    onInput={e => {
      // infer correct event type
      expectType<EventTarget | null>(e.target)
    }}
  />
)

const Foo = defineComponent({
  props: {
    foo: String,
    bar: {
      type: Number,
      required: true
    }
  }
})

// @ts-expect-error
;<Foo />
// @ts-expect-error
;<Foo bar="1" />
// @ts-expect-error
;<Foo bar={1} foo={2} />

// working
;<Foo bar={1} />
;<Foo bar={1} foo="baz" />
;<div slot="x" />

export default ({ data }: RenderContext) => {
  return <button {...data} />
}
