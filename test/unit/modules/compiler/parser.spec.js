import { parse } from 'compiler/parser/index'
import { extend } from 'shared/util'
import { baseOptions } from 'web/compiler/options'
import { isIE, isEdge } from 'core/util/env'

describe('parser', () => {
  it('simple element', () => {
    const ast = parse('<h1>hello world</h1>', baseOptions)
    expect(ast.tag).toBe('h1')
    expect(ast.plain).toBe(true)
    expect(ast.children[0].text).toBe('hello world')
  })

  it('interpolation in element', () => {
    const ast = parse('<h1>{{msg}}</h1>', baseOptions)
    expect(ast.tag).toBe('h1')
    expect(ast.plain).toBe(true)
    expect(ast.children[0].expression).toBe('_s(msg)')
  })

  it('child elements', () => {
    const ast = parse('<ul><li>hello world</li></ul>', baseOptions)
    expect(ast.tag).toBe('ul')
    expect(ast.plain).toBe(true)
    expect(ast.children[0].tag).toBe('li')
    expect(ast.children[0].plain).toBe(true)
    expect(ast.children[0].children[0].text).toBe('hello world')
    expect(ast.children[0].parent).toBe(ast)
  })

  it('unary element', () => {
    const ast = parse('<hr>', baseOptions)
    expect(ast.tag).toBe('hr')
    expect(ast.plain).toBe(true)
    expect(ast.children.length).toBe(0)
  })

  it('svg element', () => {
    const ast = parse('<svg><text>hello world</text></svg>', baseOptions)
    expect(ast.tag).toBe('svg')
    expect(ast.ns).toBe('svg')
    expect(ast.plain).toBe(true)
    expect(ast.children[0].tag).toBe('text')
    expect(ast.children[0].children[0].text).toBe('hello world')
    expect(ast.children[0].parent).toBe(ast)
  })

  it('camelCase element', () => {
    const ast = parse('<MyComponent><p>hello world</p></MyComponent>', baseOptions)
    expect(ast.tag).toBe('MyComponent')
    expect(ast.plain).toBe(true)
    expect(ast.children[0].tag).toBe('p')
    expect(ast.children[0].plain).toBe(true)
    expect(ast.children[0].children[0].text).toBe('hello world')
    expect(ast.children[0].parent).toBe(ast)
  })

  it('forbidden element', () => {
    // style
    const styleAst = parse('<style>error { color: red; }</style>', baseOptions)
    expect(styleAst.tag).toBe('style')
    expect(styleAst.plain).toBe(true)
    expect(styleAst.forbidden).toBe(true)
    expect(styleAst.children[0].text).toBe('error { color: red; }')
    expect('Templates should only be responsible for mapping the state').toHaveBeenWarned()
    // script
    const scriptAst = parse('<script type="text/javascript">alert("hello world!")</script>', baseOptions)
    expect(scriptAst.tag).toBe('script')
    expect(scriptAst.plain).toBe(false)
    expect(scriptAst.forbidden).toBe(true)
    expect(scriptAst.children[0].text).toBe('alert("hello world!")')
    expect('Templates should only be responsible for mapping the state').toHaveBeenWarned()
  })

  it('not contain root element', () => {
    parse('hello world', baseOptions)
    expect('Component template requires a root element, rather than just text').toHaveBeenWarned()
  })

  it('warn text before root element', () => {
    parse('before root {{ interpolation }}<div></div>', baseOptions)
    expect('text "before root {{ interpolation }}" outside root element will be ignored.').toHaveBeenWarned()
  })

  it('warn text after root element', () => {
    parse('<div></div>after root {{ interpolation }}', baseOptions)
    expect('text "after root {{ interpolation }}" outside root element will be ignored.').toHaveBeenWarned()
  })

  it('warn multiple root elements', () => {
    parse('<div></div><div></div>', baseOptions)
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('remove duplicate whitespace text nodes caused by comments', () => {
    const ast = parse(`<div><a></a> <!----> <a></a></div>`, baseOptions)
    expect(ast.children.length).toBe(3)
    expect(ast.children[0].tag).toBe('a')
    expect(ast.children[1].text).toBe(' ')
    expect(ast.children[2].tag).toBe('a')
  })

  it('remove text nodes between v-if conditions', () => {
    const ast = parse(`<div><div v-if="1"></div> <div v-else-if="2"></div> <div v-else></div> <span></span></div>`, baseOptions)
    expect(ast.children.length).toBe(3)
    expect(ast.children[0].tag).toBe('div')
    expect(ast.children[0].ifConditions.length).toBe(3)
    expect(ast.children[1].text).toBe(' ') // text
    expect(ast.children[2].tag).toBe('span')
  })

  it('warn non whitespace text between v-if conditions', () => {
    parse(`<div><div v-if="1"></div> foo <div v-else></div></div>`, baseOptions)
    expect(`text "foo" between v-if and v-else(-if) will be ignored`).toHaveBeenWarned()
  })

  it('not warn 2 root elements with v-if and v-else', () => {
    parse('<div v-if="1"></div><div v-else></div>', baseOptions)
    expect('Component template should contain exactly one root element')
      .not.toHaveBeenWarned()
  })

  it('not warn 3 root elements with v-if, v-else-if and v-else', () => {
    parse('<div v-if="1"></div><div v-else-if="2"></div><div v-else></div>', baseOptions)
    expect('Component template should contain exactly one root element')
      .not.toHaveBeenWarned()
  })

  it('not warn 2 root elements with v-if and v-else on separate lines', () => {
    parse(`
      <div v-if="1"></div>
      <div v-else></div>
    `, baseOptions)
    expect('Component template should contain exactly one root element')
      .not.toHaveBeenWarned()
  })

  it('not warn 3 or more root elements with v-if, v-else-if and v-else on separate lines', () => {
    parse(`
      <div v-if="1"></div>
      <div v-else-if="2"></div>
      <div v-else></div>
    `, baseOptions)
    expect('Component template should contain exactly one root element')
      .not.toHaveBeenWarned()

    parse(`
      <div v-if="1"></div>
      <div v-else-if="2"></div>
      <div v-else-if="3"></div>
      <div v-else-if="4"></div>
      <div v-else></div>
    `, baseOptions)
    expect('Component template should contain exactly one root element')
      .not.toHaveBeenWarned()
  })

  it('generate correct ast for 2 root elements with v-if and v-else on separate lines', () => {
    const ast = parse(`
      <div v-if="1"></div>
      <p v-else></p>
    `, baseOptions)
    expect(ast.tag).toBe('div')
    expect(ast.ifConditions[1].block.tag).toBe('p')
  })

  it('generate correct ast for 3 or more root elements with v-if and v-else on separate lines', () => {
    const ast = parse(`
      <div v-if="1"></div>
      <span v-else-if="2"></span>
      <p v-else></p>
    `, baseOptions)
    expect(ast.tag).toBe('div')
    expect(ast.ifConditions[0].block.tag).toBe('div')
    expect(ast.ifConditions[1].block.tag).toBe('span')
    expect(ast.ifConditions[2].block.tag).toBe('p')

    const astMore = parse(`
      <div v-if="1"></div>
      <span v-else-if="2"></span>
      <div v-else-if="3"></div>
      <span v-else-if="4"></span>
      <p v-else></p>
    `, baseOptions)
    expect(astMore.tag).toBe('div')
    expect(astMore.ifConditions[0].block.tag).toBe('div')
    expect(astMore.ifConditions[1].block.tag).toBe('span')
    expect(astMore.ifConditions[2].block.tag).toBe('div')
    expect(astMore.ifConditions[3].block.tag).toBe('span')
    expect(astMore.ifConditions[4].block.tag).toBe('p')
  })

  it('warn 2 root elements with v-if', () => {
    parse('<div v-if="1"></div><div v-if="2"></div>', baseOptions)
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('warn 3 root elements with v-if and v-else on first 2', () => {
    parse('<div v-if="1"></div><div v-else></div><div></div>', baseOptions)
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('warn 3 root elements with v-if and v-else-if on first 2', () => {
    parse('<div v-if="1"></div><div v-else-if></div><div></div>', baseOptions)
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('warn 4 root elements with v-if, v-else-if and v-else on first 2', () => {
    parse('<div v-if="1"></div><div v-else-if></div><div v-else></div><div></div>', baseOptions)
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('warn 2 root elements with v-if and v-else with v-for on 2nd', () => {
    parse('<div v-if="1"></div><div v-else v-for="i in [1]"></div>', baseOptions)
    expect('Cannot use v-for on stateful component root element because it renders multiple elements')
      .toHaveBeenWarned()
  })

  it('warn 2 root elements with v-if and v-else-if with v-for on 2nd', () => {
    parse('<div v-if="1"></div><div v-else-if="2" v-for="i in [1]"></div>', baseOptions)
    expect('Cannot use v-for on stateful component root element because it renders multiple elements')
      .toHaveBeenWarned()
  })

  it('warn <template> as root element', () => {
    parse('<template></template>', baseOptions)
    expect('Cannot use <template> as component root element').toHaveBeenWarned()
  })

  it('warn <slot> as root element', () => {
    parse('<slot></slot>', baseOptions)
    expect('Cannot use <slot> as component root element').toHaveBeenWarned()
  })

  it('warn v-for on root element', () => {
    parse('<div v-for="item in items"></div>', baseOptions)
    expect('Cannot use v-for on stateful component root element').toHaveBeenWarned()
  })

  it('warn <template> key', () => {
    parse('<div><template v-for="i in 10" :key="i"></template></div>', baseOptions)
    expect('<template> cannot be keyed').toHaveBeenWarned()
  })

  it('warn the child of the <transition-group> component has sequential index', () => {
    parse(`
      <div>
        <transition-group>
          <i v-for="(o, i) of arr" :key="i"></i>
        </transition-group>
      </div>
    `, baseOptions)
    expect('Do not use v-for index as key on <transition-group> children').toHaveBeenWarned()
  })

  it('v-pre directive', () => {
    const ast = parse('<div v-pre id="message1"><p>{{msg}}</p></div>', baseOptions)
    expect(ast.pre).toBe(true)
    expect(ast.attrs[0].name).toBe('id')
    expect(ast.attrs[0].value).toBe('"message1"')
    expect(ast.children[0].children[0].text).toBe('{{msg}}')
  })

  it('v-pre directive should leave template in DOM', () => {
    const ast = parse('<div v-pre id="message1"><template id="template1"><p>{{msg}}</p></template></div>', baseOptions)
    expect(ast.pre).toBe(true)
    expect(ast.attrs[0].name).toBe('id')
    expect(ast.attrs[0].value).toBe('"message1"')
    expect(ast.children[0].attrs[0].name).toBe('id')
    expect(ast.children[0].attrs[0].value).toBe('"template1"')
  })

  it('v-for directive basic syntax', () => {
    const ast = parse('<ul><li v-for="item in items"></li></ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
  })

  it('v-for directive iteration syntax', () => {
    const ast = parse('<ul><li v-for="(item, index) in items"></li></ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
    expect(liAst.iterator1).toBe('index')
    expect(liAst.iterator2).toBeUndefined()
  })

  it('v-for directive iteration syntax (multiple)', () => {
    const ast = parse('<ul><li v-for="(item, key, index) in items"></li></ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
    expect(liAst.iterator1).toBe('key')
    expect(liAst.iterator2).toBe('index')
  })

  it('v-for directive key', () => {
    const ast = parse('<ul><li v-for="item in items" :key="item.uid"></li></ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
    expect(liAst.key).toBe('item.uid')
  })

  it('v-for directive destructuring', () => {
    let ast = parse('<ul><li v-for="{ foo } in items"></li></ul>', baseOptions)
    let liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo }')

    // with paren
    ast = parse('<ul><li v-for="({ foo }) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo }')

    // multi-var destructuring
    ast = parse('<ul><li v-for="{ foo, bar, baz } in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo, bar, baz }')

    // multi-var destructuring with paren
    ast = parse('<ul><li v-for="({ foo, bar, baz }) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo, bar, baz }')

    // with index
    ast = parse('<ul><li v-for="({ foo }, i) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo }')
    expect(liAst.iterator1).toBe('i')

    // with key + index
    ast = parse('<ul><li v-for="({ foo }, i, j) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo }')
    expect(liAst.iterator1).toBe('i')
    expect(liAst.iterator2).toBe('j')

    // multi-var destructuring with index
    ast = parse('<ul><li v-for="({ foo, bar, baz }, i) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo, bar, baz }')
    expect(liAst.iterator1).toBe('i')

    // array
    ast = parse('<ul><li v-for="[ foo ] in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo ]')

    // multi-array
    ast = parse('<ul><li v-for="[ foo, bar, baz ] in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo, bar, baz ]')

    // array with paren
    ast = parse('<ul><li v-for="([ foo ]) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo ]')

    // multi-array with paren
    ast = parse('<ul><li v-for="([ foo, bar, baz ]) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo, bar, baz ]')

    // array with index
    ast = parse('<ul><li v-for="([ foo ], i) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo ]')
    expect(liAst.iterator1).toBe('i')

    // array with key + index
    ast = parse('<ul><li v-for="([ foo ], i, j) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo ]')
    expect(liAst.iterator1).toBe('i')
    expect(liAst.iterator2).toBe('j')

    // multi-array with paren
    ast = parse('<ul><li v-for="([ foo, bar, baz ]) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo, bar, baz ]')

    // multi-array with index
    ast = parse('<ul><li v-for="([ foo, bar, baz ], i) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo, bar, baz ]')
    expect(liAst.iterator1).toBe('i')

    // nested
    ast = parse('<ul><li v-for="({ foo, bar: { baz }, qux: [ n ] }, i, j) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('{ foo, bar: { baz }, qux: [ n ] }')
    expect(liAst.iterator1).toBe('i')
    expect(liAst.iterator2).toBe('j')

    // array nested
    ast = parse('<ul><li v-for="([ foo, { bar }, baz ], i, j) in items"></li></ul>', baseOptions)
    liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('[ foo, { bar }, baz ]')
    expect(liAst.iterator1).toBe('i')
    expect(liAst.iterator2).toBe('j')
  })

  it('v-for directive invalid syntax', () => {
    parse('<ul><li v-for="item into items"></li></ul>', baseOptions)
    expect('Invalid v-for expression').toHaveBeenWarned()
  })

  it('v-if directive syntax', () => {
    const ast = parse('<p v-if="show">hello world</p>', baseOptions)
    expect(ast.if).toBe('show')
    expect(ast.ifConditions[0].exp).toBe('show')
  })

  it('v-else-if directive syntax', () => {
    const ast = parse('<div><p v-if="show">hello</p><span v-else-if="2">elseif</span><p v-else>world</p></div>', baseOptions)
    const ifAst = ast.children[0]
    const conditionsAst = ifAst.ifConditions
    expect(conditionsAst.length).toBe(3)
    expect(conditionsAst[1].block.children[0].text).toBe('elseif')
    expect(conditionsAst[1].block.parent).toBe(ast)
    expect(conditionsAst[2].block.children[0].text).toBe('world')
    expect(conditionsAst[2].block.parent).toBe(ast)
  })

  it('v-else directive syntax', () => {
    const ast = parse('<div><p v-if="show">hello</p><p v-else>world</p></div>', baseOptions)
    const ifAst = ast.children[0]
    const conditionsAst = ifAst.ifConditions
    expect(conditionsAst.length).toBe(2)
    expect(conditionsAst[1].block.children[0].text).toBe('world')
    expect(conditionsAst[1].block.parent).toBe(ast)
  })

  it('v-else-if directive invalid syntax', () => {
    parse('<div><p v-else-if="1">world</p></div>', baseOptions)
    expect('v-else-if="1" used on element').toHaveBeenWarned()
  })

  it('v-else directive invalid syntax', () => {
    parse('<div><p v-else>world</p></div>', baseOptions)
    expect('v-else used on element').toHaveBeenWarned()
  })

  it('v-once directive syntax', () => {
    const ast = parse('<p v-once>world</p>', baseOptions)
    expect(ast.once).toBe(true)
  })

  it('slot tag single syntax', () => {
    const ast = parse('<div><slot></slot></div>', baseOptions)
    expect(ast.children[0].tag).toBe('slot')
    expect(ast.children[0].slotName).toBeUndefined()
  })

  it('slot tag named syntax', () => {
    const ast = parse('<div><slot name="one">hello world</slot></div>', baseOptions)
    expect(ast.children[0].tag).toBe('slot')
    expect(ast.children[0].slotName).toBe('"one"')
  })

  it('slot target', () => {
    const ast = parse('<p slot="one">hello world</p>', baseOptions)
    expect(ast.slotTarget).toBe('"one"')
  })

  it('component properties', () => {
    const ast = parse('<my-component :msg="hello"></my-component>', baseOptions)
    expect(ast.attrs[0].name).toBe('msg')
    expect(ast.attrs[0].value).toBe('hello')
  })

  it('component "is" attribute', () => {
    const ast = parse('<my-component is="component1"></my-component>', baseOptions)
    expect(ast.component).toBe('"component1"')
  })

  it('component "inline-template" attribute', () => {
    const ast = parse('<my-component inline-template>hello world</my-component>', baseOptions)
    expect(ast.inlineTemplate).toBe(true)
  })

  it('class binding', () => {
    // static
    const ast1 = parse('<p class="class1">hello world</p>', baseOptions)
    expect(ast1.staticClass).toBe('"class1"')
    // dynamic
    const ast2 = parse('<p :class="class1">hello world</p>', baseOptions)
    expect(ast2.classBinding).toBe('class1')
    // interpolation warning
    parse('<p class="{{error}}">hello world</p>', baseOptions)
    expect('Interpolation inside attributes has been removed').toHaveBeenWarned()
  })

  it('style binding', () => {
    const ast = parse('<p :style="error">hello world</p>', baseOptions)
    expect(ast.styleBinding).toBe('error')
  })

  it('attribute with v-bind', () => {
    const ast = parse('<input type="text" name="field1" :value="msg">', baseOptions)
    expect(ast.attrsList[0].name).toBe('type')
    expect(ast.attrsList[0].value).toBe('text')
    expect(ast.attrsList[1].name).toBe('name')
    expect(ast.attrsList[1].value).toBe('field1')
    expect(ast.attrsMap['type']).toBe('text')
    expect(ast.attrsMap['name']).toBe('field1')
    expect(ast.attrs[0].name).toBe('type')
    expect(ast.attrs[0].value).toBe('"text"')
    expect(ast.attrs[1].name).toBe('name')
    expect(ast.attrs[1].value).toBe('"field1"')
    expect(ast.props[0].name).toBe('value')
    expect(ast.props[0].value).toBe('msg')
  })

  it('empty v-bind expression', () => {
    parse('<div :empty-msg=""></div>', baseOptions)
    expect('The value for a v-bind expression cannot be empty. Found in "v-bind:empty-msg"').toHaveBeenWarned()
  })

  if (process.env.VBIND_PROP_SHORTHAND) {
    it('v-bind.prop shorthand syntax', () => {
      const ast = parse('<div .id="foo"></div>', baseOptions)
      expect(ast.props).toEqual([{ name: 'id', value: 'foo', dynamic: false }])
    })

    it('v-bind.prop shorthand syntax w/ modifiers', () => {
      const ast = parse('<div .id.mod="foo"></div>', baseOptions)
      expect(ast.props).toEqual([{ name: 'id', value: 'foo', dynamic: false }])
    })

    it('v-bind.prop shorthand dynamic argument', () => {
      const ast = parse('<div .[id]="foo"></div>', baseOptions)
      expect(ast.props).toEqual([{ name: 'id', value: 'foo', dynamic: true }])
    })
  }

  // This only works for string templates.
  // In-DOM templates will be malformed before Vue can parse it.
  describe('parse and warn invalid dynamic arguments', () => {
    [
      `<div v-bind:['foo' + bar]="baz"/>`,
      `<div :['foo' + bar]="baz"/>`,
      `<div @['foo' + bar]="baz"/>`,
      `<foo #['foo' + bar]="baz"/>`,
      `<div :['foo' + bar].some.mod="baz"/>`
    ].forEach(template => {
      it(template, () => {
        const ast = parse(template, baseOptions)
        expect(`Invalid dynamic argument expression`).toHaveBeenWarned()
      })
    })
  })

  // #9781
  it('multiple dynamic slot names without warning', () => {
    const ast = parse(`<my-component>
      <template #[foo]>foo</template>
      <template #[data]="scope">scope</template>
      <template #[bar]>bar</template>
    </my-component>`, baseOptions)

    expect(`Invalid dynamic argument expression`).not.toHaveBeenWarned()
    expect(ast.scopedSlots.foo).not.toBeUndefined()
    expect(ast.scopedSlots.data).not.toBeUndefined()
    expect(ast.scopedSlots.bar).not.toBeUndefined()
    expect(ast.scopedSlots.foo.type).toBe(1)
    expect(ast.scopedSlots.data.type).toBe(1)
    expect(ast.scopedSlots.bar.type).toBe(1)
    expect(ast.scopedSlots.foo.attrsMap['#[foo]']).toBe('')
    expect(ast.scopedSlots.bar.attrsMap['#[bar]']).toBe('')
    expect(ast.scopedSlots.data.attrsMap['#[data]']).toBe('scope')
  })

  // #6887
  it('special case static attribute that must be props', () => {
    const ast = parse('<video muted></video>', baseOptions)
    expect(ast.attrs[0].name).toBe('muted')
    expect(ast.attrs[0].value).toBe('""')
    expect(ast.props[0].name).toBe('muted')
    expect(ast.props[0].value).toBe('true')
  })

  it('attribute with v-on', () => {
    const ast = parse('<input type="text" name="field1" :value="msg" @input="onInput">', baseOptions)
    expect(ast.events.input.value).toBe('onInput')
  })

  it('attribute with directive', () => {
    const ast = parse('<input type="text" name="field1" :value="msg" v-validate:field1="required">', baseOptions)
    expect(ast.directives[0].name).toBe('validate')
    expect(ast.directives[0].value).toBe('required')
    expect(ast.directives[0].arg).toBe('field1')
  })

  it('attribute with modifiered directive', () => {
    const ast = parse('<input type="text" name="field1" :value="msg" v-validate.on.off>', baseOptions)
    expect(ast.directives[0].modifiers.on).toBe(true)
    expect(ast.directives[0].modifiers.off).toBe(true)
  })

  it('literal attribute', () => {
    // basic
    const ast1 = parse('<input type="text" name="field1" value="hello world">', baseOptions)
    expect(ast1.attrsList[0].name).toBe('type')
    expect(ast1.attrsList[0].value).toBe('text')
    expect(ast1.attrsList[1].name).toBe('name')
    expect(ast1.attrsList[1].value).toBe('field1')
    expect(ast1.attrsList[2].name).toBe('value')
    expect(ast1.attrsList[2].value).toBe('hello world')
    expect(ast1.attrsMap['type']).toBe('text')
    expect(ast1.attrsMap['name']).toBe('field1')
    expect(ast1.attrsMap['value']).toBe('hello world')
    expect(ast1.attrs[0].name).toBe('type')
    expect(ast1.attrs[0].value).toBe('"text"')
    expect(ast1.attrs[1].name).toBe('name')
    expect(ast1.attrs[1].value).toBe('"field1"')
    expect(ast1.attrs[2].name).toBe('value')
    expect(ast1.attrs[2].value).toBe('"hello world"')
    // interpolation warning
    parse('<input type="text" name="field1" value="{{msg}}">', baseOptions)
    expect('Interpolation inside attributes has been removed').toHaveBeenWarned()
  })

  if (!isIE && !isEdge) {
    it('duplicate attribute', () => {
      parse('<p class="class1" class="class1">hello world</p>', baseOptions)
      expect('duplicate attribute').toHaveBeenWarned()
    })
  }

  it('custom delimiter', () => {
    const ast = parse('<p>{msg}</p>', extend({ delimiters: ['{', '}'] }, baseOptions))
    expect(ast.children[0].expression).toBe('_s(msg)')
  })

  it('not specified getTagNamespace option', () => {
    const options = extend({}, baseOptions)
    delete options.getTagNamespace
    const ast = parse('<svg><text>hello world</text></svg>', options)
    expect(ast.tag).toBe('svg')
    expect(ast.ns).toBeUndefined()
  })

  it('not specified mustUseProp', () => {
    const options = extend({}, baseOptions)
    delete options.mustUseProp
    const ast = parse('<input type="text" name="field1" :value="msg">', options)
    expect(ast.props).toBeUndefined()
  })

  it('use prop when prop modifier was explicitly declared', () => {
    const ast = parse('<component is="textarea" :value.prop="val" />', baseOptions)
    expect(ast.attrs).toBeUndefined()
    expect(ast.props.length).toBe(1)
    expect(ast.props[0].name).toBe('value')
    expect(ast.props[0].value).toBe('val')
  })

  it('pre/post transforms', () => {
    const options = extend({}, baseOptions)
    const spy1 = jasmine.createSpy('preTransform')
    const spy2 = jasmine.createSpy('postTransform')
    options.modules = options.modules.concat([{
      preTransformNode (el) {
        spy1(el.tag)
      },
      postTransformNode (el) {
        expect(el.attrs.length).toBe(1)
        spy2(el.tag)
      }
    }])
    parse('<img v-pre src="hi">', options)
    expect(spy1).toHaveBeenCalledWith('img')
    expect(spy2).toHaveBeenCalledWith('img')
  })

  it('preserve whitespace in <pre> tag', function () {
    const options = extend({}, baseOptions)
    const ast = parse('<pre><code>  \n<span>hi</span>\n  </code><span> </span></pre>', options)
    const code = ast.children[0]
    expect(code.children[0].type).toBe(3)
    expect(code.children[0].text).toBe('  \n')
    expect(code.children[2].type).toBe(3)
    expect(code.children[2].text).toBe('\n  ')

    const span = ast.children[1]
    expect(span.children[0].type).toBe(3)
    expect(span.children[0].text).toBe(' ')
  })

  // #5992
  it('ignore the first newline in <pre> tag', function () {
    const options = extend({}, baseOptions)
    const ast = parse('<div><pre>\nabc</pre>\ndef<pre>\n\nabc</pre></div>', options)
    const pre = ast.children[0]
    expect(pre.children[0].type).toBe(3)
    expect(pre.children[0].text).toBe('abc')
    const text = ast.children[1]
    expect(text.type).toBe(3)
    expect(text.text).toBe('\ndef')
    const pre2 = ast.children[2]
    expect(pre2.children[0].type).toBe(3)
    expect(pre2.children[0].text).toBe('\nabc')
  })

  it('keep first newline after unary tag in <pre>', () => {
    const options = extend({}, baseOptions)
    const ast = parse('<pre>abc<input>\ndef</pre>', options)
    expect(ast.children[1].type).toBe(1)
    expect(ast.children[1].tag).toBe('input')
    expect(ast.children[2].type).toBe(3)
    expect(ast.children[2].text).toBe('\ndef')
  })

  it('forgivingly handle < in plain text', () => {
    const options = extend({}, baseOptions)
    const ast = parse('<p>1 < 2 < 3</p>', options)
    expect(ast.tag).toBe('p')
    expect(ast.children.length).toBe(1)
    expect(ast.children[0].type).toBe(3)
    expect(ast.children[0].text).toBe('1 < 2 < 3')
  })

  it('IE conditional comments', () => {
    const options = extend({}, baseOptions)
    const ast = parse(`
      <div>
        <!--[if lte IE 8]>
          <p>Test 1</p>
        <![endif]-->
      </div>
    `, options)
    expect(ast.tag).toBe('div')
    expect(ast.children.length).toBe(0)
  })

  it('parse content in textarea as text', () => {
    const options = extend({}, baseOptions)

    const whitespace = parse(`
      <textarea>
        <p>Test 1</p>
        test2
      </textarea>
    `, options)
    expect(whitespace.tag).toBe('textarea')
    expect(whitespace.children.length).toBe(1)
    expect(whitespace.children[0].type).toBe(3)
    // textarea is whitespace sensitive
    expect(whitespace.children[0].text).toBe(`        <p>Test 1</p>
        test2
      `)

    const comment = parse('<textarea><!--comment--></textarea>', options)
    expect(comment.tag).toBe('textarea')
    expect(comment.children.length).toBe(1)
    expect(comment.children[0].type).toBe(3)
    expect(comment.children[0].text).toBe('<!--comment-->')
  })

  // #5526
  it('should not decode text in script tags', () => {
    const options = extend({}, baseOptions)
    const ast = parse(`<script type="x/template">&gt;<foo>&lt;</script>`, options)
    expect(ast.children[0].text).toBe(`&gt;<foo>&lt;`)
  })

  it('should ignore comments', () => {
    const options = extend({}, baseOptions)
    const ast = parse(`<div>123<!--comment here--></div>`, options)
    expect(ast.tag).toBe('div')
    expect(ast.children.length).toBe(1)
    expect(ast.children[0].type).toBe(3)
    expect(ast.children[0].text).toBe('123')
  })

  it('should kept comments', () => {
    const options = extend({
      comments: true
    }, baseOptions)
    const ast = parse(`<div>123<!--comment here--></div>`, options)
    expect(ast.tag).toBe('div')
    expect(ast.children.length).toBe(2)
    expect(ast.children[0].type).toBe(3)
    expect(ast.children[0].text).toBe('123')
    expect(ast.children[1].type).toBe(3) // parse comment with ASTText
    expect(ast.children[1].isComment).toBe(true) // parse comment with ASTText
    expect(ast.children[1].text).toBe('comment here')
  })

  // #9407
  it('should parse templates with comments anywhere', () => {
    const options = extend({
      comments: true
    }, baseOptions)
    const ast = parse(`<!--comment here--><div>123</div>`, options)
    expect(ast.tag).toBe('div')
    expect(ast.children.length).toBe(1)
  })

  // #8103
  it('should allow CRLFs in string interpolations', () => {
    const ast = parse(`<p>{{\r\nmsg\r\n}}</p>`, baseOptions)
    expect(ast.children[0].expression).toBe('_s(msg)')
  })

  it('preserveWhitespace: false', () => {
    const options = extend({
      preserveWhitespace: false
    }, baseOptions)

    const ast = parse('<p>\n  Welcome to <b>Vue.js</b>    <i>world</i>  \n  <span>.\n  Have fun!\n</span></p>', options)
    expect(ast.tag).toBe('p')
    expect(ast.children.length).toBe(4)
    expect(ast.children[0].type).toBe(3)
    expect(ast.children[0].text).toBe('\n  Welcome to ')
    expect(ast.children[1].tag).toBe('b')
    expect(ast.children[1].children[0].text).toBe('Vue.js')
    expect(ast.children[2].tag).toBe('i')
    expect(ast.children[2].children[0].text).toBe('world')
    expect(ast.children[3].tag).toBe('span')
    expect(ast.children[3].children[0].text).toBe('.\n  Have fun!\n')
  })

  const condenseOptions = extend({
    whitespace: 'condense',
    // should be ignored when whitespace is specified
    preserveWhitespace: false
  }, baseOptions)

  it(`whitespace: 'condense'`, () => {
    const options = extend({}, condenseOptions)
    const ast = parse('<p>\n  Welcome to <b>Vue.js</b>    <i>world</i>  \n  <span>.\n  Have fun!\n</span></p>', options)
    expect(ast.tag).toBe('p')
    expect(ast.children.length).toBe(5)
    expect(ast.children[0].type).toBe(3)
    expect(ast.children[0].text).toBe(' Welcome to ')
    expect(ast.children[1].tag).toBe('b')
    expect(ast.children[1].children[0].text).toBe('Vue.js')
    expect(ast.children[2].type).toBe(3)
    // should condense inline whitespace into single space
    expect(ast.children[2].text).toBe(' ')
    expect(ast.children[3].tag).toBe('i')
    expect(ast.children[3].children[0].text).toBe('world')
    // should have removed the whitespace node between tags that contains newlines
    expect(ast.children[4].tag).toBe('span')
    expect(ast.children[4].children[0].text).toBe('. Have fun! ')
  })

  it(`preserve whitespace in <pre> tag with whitespace: 'condense'`, function () {
    const options = extend({}, condenseOptions)
    const ast = parse('<pre><code>  \n<span>hi</span>\n  </code><span> </span></pre>', options)
    const code = ast.children[0]
    expect(code.children[0].type).toBe(3)
    expect(code.children[0].text).toBe('  \n')
    expect(code.children[2].type).toBe(3)
    expect(code.children[2].text).toBe('\n  ')

    const span = ast.children[1]
    expect(span.children[0].type).toBe(3)
    expect(span.children[0].text).toBe(' ')
  })

  it(`ignore the first newline in <pre> tag with whitespace: 'condense'`, function () {
    const options = extend({}, condenseOptions)
    const ast = parse('<div><pre>\nabc</pre>\ndef<pre>\n\nabc</pre></div>', options)
    const pre = ast.children[0]
    expect(pre.children[0].type).toBe(3)
    expect(pre.children[0].text).toBe('abc')
    const text = ast.children[1]
    expect(text.type).toBe(3)
    expect(text.text).toBe(' def')
    const pre2 = ast.children[2]
    expect(pre2.children[0].type).toBe(3)
    expect(pre2.children[0].text).toBe('\nabc')
  })

  it(`keep first newline after unary tag in <pre> with whitespace: 'condense'`, () => {
    const options = extend({}, condenseOptions)
    const ast = parse('<pre>abc<input>\ndef</pre>', options)
    expect(ast.children[1].type).toBe(1)
    expect(ast.children[1].tag).toBe('input')
    expect(ast.children[2].type).toBe(3)
    expect(ast.children[2].text).toBe('\ndef')
  })
})
