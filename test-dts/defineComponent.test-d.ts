import {
  ref,
  reactive,
  expectType,
  expectError,
  isNotAnyOrUndefined,
  defineComponent,
  PropType,
} from './index'

describe('with object props', () => {
  interface ExpectedProps {
    a?: number | undefined
    b: string
    e?: Function
    bb: string
    bbb: string
    cc?: string[] | undefined
    dd: { n: 1 }
    ee?: () => string
    ff?: (a: number, b: string) => { a: boolean }
    ccc?: string[] | undefined
    ddd: string[]
    eee: () => { a: string }
    fff: (a: number, b: string) => { a: boolean }
    hhh: boolean
    ggg: 'foo' | 'bar'
    ffff: (a: number, b: string) => { a: boolean }
    validated?: string
    date: Date
  }

  type GT = string & { __brand: unknown }

  defineComponent({
    props: {
      a: Number,
      // required should make property non-void
      b: {
        type: String,
        required: true,
      },
      e: Function,
      // default value should infer type and make it non-void
      bb: {
        default: 'hello',
      },
      bbb: {
        // Note: default function value requires arrow syntax + explicit
        // annotation
        default: (props: any) => (props.bb as string) || 'foo',
      },
      // explicit type casting
      cc: Array as PropType<string[]>,
      // required + type casting
      dd: {
        type: Object as PropType<{ n: 1 }>,
        required: true,
      },
      // return type
      ee: Function as PropType<() => string>,
      // arguments + object return
      ff: Function as PropType<(a: number, b: string) => { a: boolean }>,
      // explicit type casting with constructor
      ccc: Array as () => string[],
      // required + contructor type casting
      ddd: {
        type: Array as () => string[],
        required: true,
      },
      // required + object return
      eee: {
        type: Function as PropType<() => { a: string }>,
        required: true,
      },
      // required + arguments + object return
      fff: {
        type: Function as PropType<(a: number, b: string) => { a: boolean }>,
        required: true,
      },
      // default + type casting
      ggg: {
        type: String as PropType<'foo' | 'bar'>,
        default: 'foo',
      },
      hhh: {
        type: Boolean,
        required: true,
      },
      // default + function
      ffff: {
        type: Function as PropType<(a: number, b: string) => { a: boolean }>,
        default: (_a: number, _b: string) => ({ a: true }),
      },
      validated: {
        type: String,
        // validator requires explicit annotation
        validator: (val: unknown) => val !== '',
      },
      date: {
        type: Date,
        required: true,
      },
    },
    setup(props) {
      // type assertion. See https://github.com/SamVerschueren/tsd
      expectType<ExpectedProps['a']>(props.a)
      expectType<ExpectedProps['b']>(props.b)
      expectType<ExpectedProps['e']>(props.e)
      expectType<ExpectedProps['bb']>(props.bb)
      expectType<ExpectedProps['cc']>(props.cc)
      expectType<ExpectedProps['dd']>(props.dd)
      expectType<ExpectedProps['ee']>(props.ee)
      expectType<ExpectedProps['ff']>(props.ff)
      expectType<ExpectedProps['bbb']>(props.bbb)
      expectType<ExpectedProps['ccc']>(props.ccc)
      expectType<ExpectedProps['ddd']>(props.ddd)
      expectType<ExpectedProps['eee']>(props.eee)
      expectType<ExpectedProps['fff']>(props.fff)
      expectType<ExpectedProps['ggg']>(props.ggg)
      expectType<ExpectedProps['hhh']>(props.hhh)
      expectType<ExpectedProps['ffff']>(props.ffff)
      expectType<ExpectedProps['validated']>(props.validated)
      expectType<ExpectedProps['date']>(props.date)

      isNotAnyOrUndefined(props.a)
      isNotAnyOrUndefined(props.b)
      isNotAnyOrUndefined(props.e)
      isNotAnyOrUndefined(props.bb)
      isNotAnyOrUndefined(props.cc)
      isNotAnyOrUndefined(props.dd)
      isNotAnyOrUndefined(props.ee)
      isNotAnyOrUndefined(props.ff)
      isNotAnyOrUndefined(props.bbb)
      isNotAnyOrUndefined(props.ccc)
      isNotAnyOrUndefined(props.ddd)
      isNotAnyOrUndefined(props.eee)
      isNotAnyOrUndefined(props.fff)
      isNotAnyOrUndefined(props.ggg)
      isNotAnyOrUndefined(props.hhh)
      isNotAnyOrUndefined(props.ffff)

      expectError((props.a = 1))

      // setup context
      return {
        c: ref(1),
        d: {
          e: ref('hi'),
        },
        f: reactive({
          g: ref('hello' as GT),
        }),
      }
    },
    render(h) {
      const props = this.$props
      expectType<ExpectedProps['a']>(props.a)
      expectType<ExpectedProps['b']>(props.b)
      expectType<ExpectedProps['e']>(props.e)
      expectType<ExpectedProps['bb']>(props.bb)
      expectType<ExpectedProps['cc']>(props.cc)
      expectType<ExpectedProps['dd']>(props.dd)
      expectType<ExpectedProps['ee']>(props.ee)
      expectType<ExpectedProps['ff']>(props.ff)
      expectType<ExpectedProps['bbb']>(props.bbb)
      expectType<ExpectedProps['ccc']>(props.ccc)
      expectType<ExpectedProps['ddd']>(props.ddd)
      expectType<ExpectedProps['eee']>(props.eee)
      expectType<ExpectedProps['fff']>(props.fff)
      expectType<ExpectedProps['ggg']>(props.ggg)
      expectType<ExpectedProps['hhh']>(props.hhh)
      expectType<ExpectedProps['ffff']>(props.ffff)
      expectType<ExpectedProps['validated']>(props.validated)

      // @ts-expect-error props should be readonly
      expectError((props.a = 1))

      // should also expose declared props on `this`
      expectType<ExpectedProps['a']>(this.a)
      expectType<ExpectedProps['b']>(this.b)
      expectType<ExpectedProps['e']>(this.e)
      expectType<ExpectedProps['bb']>(this.bb)
      expectType<ExpectedProps['cc']>(this.cc)
      expectType<ExpectedProps['dd']>(this.dd)
      expectType<ExpectedProps['ee']>(this.ee)
      expectType<ExpectedProps['ff']>(this.ff)
      expectType<ExpectedProps['bbb']>(this.bbb)
      expectType<ExpectedProps['ccc']>(this.ccc)
      expectType<ExpectedProps['ddd']>(this.ddd)
      expectType<ExpectedProps['eee']>(this.eee)
      expectType<ExpectedProps['fff']>(this.fff)
      expectType<ExpectedProps['ggg']>(this.ggg)
      expectType<ExpectedProps['ffff']>(this.ffff)
      expectType<ExpectedProps['hhh']>(this.hhh)

      // @ts-expect-error props on `this` should be readonly
      expectError((this.a = 1))

      // assert setup context unwrapping
      expectType<number>(this.c)
      expectType<string>(this.d.e.value)
      expectType<GT>(this.f.g)

      // setup context properties should be mutable
      this.c = 2

      return h()
    },
  })
})

describe('type inference w/ array props declaration', () => {
  defineComponent({
    props: ['a', 'b'],
    setup(props) {
      // @ts-expect-error props should be readonly
      expectError((props.a = 1))
      expectType<any>(props.a)
      expectType<any>(props.b)
      return {
        c: 1,
      }
    },
    render(h) {
      expectType<any>(this.$props.a)
      expectType<any>(this.$props.b)
      // @ts-expect-error
      expectError((this.$props.a = 1))
      expectType<any>(this.a)
      expectType<any>(this.b)
      expectType<number>(this.c)

      return h()
    },
  })
})

describe('type inference w/ options API', () => {
  defineComponent({
    props: { a: Number },
    setup() {
      return {
        b: 123,
      }
    },
    data() {
      // Limitation: we cannot expose the return result of setup() on `this`
      // here in data() - somehow that would mess up the inference
      expectType<number | undefined>(this.a)
      expectType<Function>(this.$emit)
      return {
        c: this.a || 123,
      }
    },
    computed: {
      d(): number {
        expectType<number>(this.b)
        return this.b + 1
      },
    },
    watch: {
      a() {
        expectType<number>(this.b)
        this.b + 1
      },
    },
    created() {
      // props
      expectType<number | undefined>(this.a)
      // returned from setup()
      expectType<number>(this.b)
      // returned from data()
      expectType<number>(this.c)
      // computed
      expectType<number>(this.d)
    },
    methods: {
      doSomething() {
        // props
        expectType<number | undefined>(this.a)
        // returned from setup()
        expectType<number>(this.b)
        // returned from data()
        expectType<number>(this.c)
        // computed
        expectType<number>(this.d)
      },
    },
    render(h) {
      // props
      expectType<number | undefined>(this.a)
      // returned from setup()
      expectType<number>(this.b)
      // returned from data()
      expectType<number>(this.c)
      // computed
      expectType<number>(this.d)

      return h()
    },
  })
})
describe('with mixins', () => {
  /*
  const MixinA = defineComponent({
    props: {
      aP1: {
        type: String,
        default: 'aP1'
      },
      aP2: Boolean
    },
    data() {
      return {
        a: 1
      }
    }
  })
  const MixinB = defineComponent({
    props: ['bP1', 'bP2'],
    data() {
      return {
        b: 2
      }
    }
  })
  const MixinC = defineComponent({
    data() {
      return {
        c: 3
      }
    }
  })
  const MixinD = defineComponent({
    mixins: [MixinA],
    data() {
      return {
        d: 4
      }
    },
    computed: {
      dC1(): number {
        return this.d + this.a
      },
      dC2(): string {
        return this.aP1 + 'dC2'
      }
    }
  })
  const MyComponent = defineComponent({
    mixins: [MixinA, MixinB, MixinC, MixinD],
    props: {
      // required should make property non-void
      z: {
        type: String,
        required: true
      }
    },
    render() {
      const props = this.$props
      // props
      expectType<string>(props.aP1)
      expectType<boolean | undefined>(props.aP2)
      expectType<any>(props.bP1)
      expectType<any>(props.bP2)
      expectType<string>(props.z)

      const data = this.$data
      expectType<number>(data.a)
      expectType<number>(data.b)
      expectType<number>(data.c)
      expectType<number>(data.d)

      // should also expose declared props on `this`
      expectType<number>(this.a)
      expectType<string>(this.aP1)
      expectType<boolean | undefined>(this.aP2)
      expectType<number>(this.b)
      expectType<any>(this.bP1)
      expectType<number>(this.c)
      expectType<number>(this.d)
      expectType<number>(this.dC1)
      expectType<string>(this.dC2)

      // props should be readonly
      // @ts-expect-error
      expectError((this.aP1 = 'new'))
      // @ts-expect-error
      expectError((this.z = 1))

      // props on `this` should be readonly
      // @ts-expect-error
      expectError((this.bP1 = 1))

      // string value can not assigned to number type value
      // @ts-expect-error
      expectError((this.c = '1'))

      // setup context properties should be mutable
      this.d = 5

      return null
    }
  })

  // Test TSX
  expectType<JSX.Element>(
    <MyComponent aP1={'aP'} aP2 bP1={1} bP2={[1, 2]} z={'z'} />
  )

  // missing required props
  // @ts-expect-error
  expectError(<MyComponent />)

  // wrong prop types
  // @ts-expect-error
  expectError(<MyComponent aP1="ap" aP2={'wrong type'} bP1="b" z={'z'} />)
  // @ts-expect-error
  expectError(<MyComponent aP1={1} bP2={[1]} />)
  */
})

describe('with extends', () => {
  /*
  const Base = defineComponent({
    props: {
      aP1: Boolean,
      aP2: {
        type: Number,
        default: 2
      }
    },
    data() {
      return {
        a: 1
      }
    },
    computed: {
      c(): number {
        return this.aP2 + this.a
      }
    }
  })
  const MyComponent = defineComponent({
    extends: Base,
    props: {
      // required should make property non-void
      z: {
        type: String,
        required: true
      }
    },
    render() {
      const props = this.$props
      // props
      expectType<boolean | undefined>(props.aP1)
      expectType<number>(props.aP2)
      expectType<string>(props.z)

      const data = this.$data
      expectType<number>(data.a)

      // should also expose declared props on `this`
      expectType<number>(this.a)
      expectType<boolean | undefined>(this.aP1)
      expectType<number>(this.aP2)

      // setup context properties should be mutable
      this.a = 5

      return null
    }
  })

  // Test TSX
  expectType<JSX.Element>(<MyComponent aP2={3} aP1 z={'z'} />)

  // missing required props
  // @ts-expect-error
  expectError(<MyComponent />)

  // wrong prop types
  // @ts-expect-error
  expectError(<MyComponent aP2={'wrong type'} z={'z'} />)
  // @ts-expect-error
  expectError(<MyComponent aP1={3} />)
  */
})
describe('extends with mixins', () => {
  /*
  const Mixin = defineComponent({
    props: {
      mP1: {
        type: String,
        default: 'mP1'
      },
      mP2: Boolean
    },
    data() {
      return {
        a: 1
      }
    }
  })
  const Base = defineComponent({
    props: {
      p1: Boolean,
      p2: {
        type: Number,
        default: 2
      }
    },
    data() {
      return {
        b: 2
      }
    },
    computed: {
      c(): number {
        return this.p2 + this.b
      }
    }
  })
  const MyComponent = defineComponent({
    extends: Base,
    mixins: [Mixin],
    props: {
      // required should make property non-void
      z: {
        type: String,
        required: true
      }
    },
    render() {
      const props = this.$props
      // props
      expectType<boolean | undefined>(props.p1)
      expectType<number>(props.p2)
      expectType<string>(props.z)
      expectType<string>(props.mP1)
      expectType<boolean | undefined>(props.mP2)

      const data = this.$data
      expectType<number>(data.a)
      expectType<number>(data.b)

      // should also expose declared props on `this`
      expectType<number>(this.a)
      expectType<number>(this.b)
      expectType<boolean | undefined>(this.p1)
      expectType<number>(this.p2)
      expectType<string>(this.mP1)
      expectType<boolean | undefined>(this.mP2)

      // setup context properties should be mutable
      this.a = 5

      return null
    }
  })

  // Test TSX
  expectType<JSX.Element>(<MyComponent mP1="p1" mP2 p1 p2={1} z={'z'} />)

  // missing required props
  // @ts-expect-error
  expectError(<MyComponent />)

  // wrong prop types
  // @ts-expect-error
  expectError(<MyComponent p2={'wrong type'} z={'z'} />)
  // @ts-expect-error
  expectError(<MyComponent mP1={3} />)
  */
})

describe('compatibility w/ createApp', () => {
  /*
  const comp = defineComponent({})
  createApp(comp).mount('#hello')

  const comp2 = defineComponent({
    props: { foo: String }
  })
  createApp(comp2).mount('#hello')

  const comp3 = defineComponent({
    setup() {
      return {
        a: 1
      }
    }
  })
  createApp(comp3).mount('#hello')
  */
})

describe('defineComponent', () => {
  test('should accept components defined with defineComponent', () => {
    const comp = defineComponent({})
    defineComponent({
      components: { comp },
    })
  })
})

describe('emits', () => {
  /*

  // Note: for TSX inference, ideally we want to map emits to onXXX props,
  // but that requires type-level string constant concatenation as suggested in
  // https://github.com/Microsoft/TypeScript/issues/12754

  // The workaround for TSX users is instead of using emits, declare onXXX props
  // and call them instead. Since `v-on:click` compiles to an `onClick` prop,
  // this would also support other users consuming the component in templates
  // with `v-on` listeners.

  // with object emits
  defineComponent({
    emits: {
      click: (n: number) => typeof n === 'number',
      input: (b: string) => null
    },
    setup(props, { emit }) {
      emit('click', 1)
      emit('input', 'foo')
      //  @ts-expect-error
      expectError(emit('nope'))
      //  @ts-expect-error
      expectError(emit('click'))
      //  @ts-expect-error
      expectError(emit('click', 'foo'))
      //  @ts-expect-error
      expectError(emit('input'))
      //  @ts-expect-error
      expectError(emit('input', 1))
    },
    created() {
      this.$emit('click', 1)
      this.$emit('input', 'foo')
      //  @ts-expect-error
      expectError(this.$emit('nope'))
      //  @ts-expect-error
      expectError(this.$emit('click'))
      //  @ts-expect-error
      expectError(this.$emit('click', 'foo'))
      //  @ts-expect-error
      expectError(this.$emit('input'))
      //  @ts-expect-error
      expectError(this.$emit('input', 1))
    }
  })

  // with array emits
  defineComponent({
    emits: ['foo', 'bar'],
    setup(props, { emit }) {
      emit('foo')
      emit('foo', 123)
      emit('bar')
      //  @ts-expect-error
      expectError(emit('nope'))
    },
    created() {
      this.$emit('foo')
      this.$emit('foo', 123)
      this.$emit('bar')
      //  @ts-expect-error
      expectError(this.$emit('nope'))
    }
  })
  */
})

describe('vetur', () => {
  // #609
  it('should have access to options API', () => {
    const Comp = defineComponent({
      data() {
        return {
          a: 1,
        }
      },

      computed: {
        ac() {
          return 1
        },
      },

      methods: {
        callA(b: number) {
          return b
        },
      },

      setup() {
        return {
          sa: '1',
        }
      },
    })

    const comp = new Comp()

    expectType<number>(comp.a)
    expectType<number>(comp.ac)
    expectType<string>(comp.sa)
    expectType<(b: number) => number>(comp.callA)
  })
})
