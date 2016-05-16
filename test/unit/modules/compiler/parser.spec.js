import { parse } from 'compiler/parser/index'
import directives from 'web/compiler/directives/index'
import { extend } from 'shared/util'
import { isReservedTag, isUnaryTag, mustUseProp, getTagNamespace } from 'web/util/index'

describe('parser', () => {
  const baseOptions = {
    expectHTML: true,
    preserveWhitespace: true,
    directives,
    isReservedTag,
    isUnaryTag,
    mustUseProp,
    getTagNamespace
  }

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
    expect(ast.children[0].expression).toBe('__toString__(msg)')
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
    expect(ast.tag).toBe('my-component')
    expect(ast.plain).toBe(true)
    expect('Found camelCase tag in template').toHaveBeenWarned()
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
    expect('Templates should only be responsbile for mapping the state').toHaveBeenWarned()
    // script
    const scriptAst = parse('<script type="text/javascript">alert("hello world!")</script>', baseOptions)
    expect(scriptAst.tag).toBe('script')
    expect(scriptAst.plain).toBe(false)
    expect(scriptAst.forbidden).toBe(true)
    expect(scriptAst.children[0].text).toBe('alert("hello world!")')
    expect('Templates should only be responsbile for mapping the state').toHaveBeenWarned()
  })

  it('not contain root element', () => {
    parse('hello world', baseOptions)
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('v-pre directive', () => {
    const ast = parse('<div v-pre id="message1"><p>{{msg}}</p></div>', baseOptions)
    expect(ast.pre).toBe(true)
    expect(ast.attrs[0].name).toBe('id')
    expect(ast.attrs[0].value).toBe('"message1"')
    expect(ast.children[0].children[0].text).toBe('{{msg}}')
  })

  it('v-for directive basic syntax', () => {
    const ast = parse('<ul><li v-for="item in items"></li><ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
  })

  it('v-for directive iteration syntax', () => {
    const ast = parse('<ul><li v-for="(index, item) in items"></li><ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
    expect(liAst.iterator).toBe('index')
  })

  it('v-for directive track-by', () => {
    const ast = parse('<ul><li v-for="item in items" track-by="item.uid"></li><ul>', baseOptions)
    const liAst = ast.children[0]
    expect(liAst.for).toBe('items')
    expect(liAst.alias).toBe('item')
    expect(liAst.key).toBe('item.uid')
  })

  it('v-for directive invalid syntax', () => {
    parse('<ul><li v-for="item into items"></li><ul>', baseOptions)
    expect('Invalid v-for expression').toHaveBeenWarned()
  })

  it('v-if directive syntax', () => {
    const ast = parse('<p v-if="show">hello world</p>', baseOptions)
    expect(ast.if).toBe('show')
  })

  it('v-else directive syntax', () => {
    const ast = parse('<div><p v-if="show">hello</p><p v-else>world</p></div>', baseOptions)
    const ifAst = ast.children[0]
    const elseAst = ifAst.elseBlock
    expect(elseAst.else).toBe(true)
    expect(elseAst.children[0].text).toBe('world')
    expect(elseAst.parent).toBe(ast)
  })

  it('v-else directive invalid syntax', () => {
    parse('<div><p v-else>world</p></div>', baseOptions)
    expect('v-else used on element').toHaveBeenWarned()
  })

  it('v-once directive syntax', () => {
    const ast = parse('<p v-once>world</p>', baseOptions)
    expect(ast.once).toBe(true)
  })

  it('render tag syntax', () => {
    const ast = parse('<render :method="onRender", :args="params"></render>', baseOptions)
    expect(ast.render).toBe(true)
    expect(ast.renderMethod).toBe('onRender')
    expect(ast.renderArgs).toBe('params')
  })

  it('render tag invalid syntax', () => {
    // method nothing
    const invalidAst1 = parse('<render></render>', baseOptions)
    expect('method attribute is required on <render>.').toHaveBeenWarned()
    expect(invalidAst1.render).toBe(true)
    expect(invalidAst1.renderMethod).toBeUndefined()
    expect(invalidAst1.renderArgs).toBeUndefined()
    // method no dynamic binding
    parse('<render method="onRender"></render>', baseOptions)
    expect('<render> method should use a dynamic binding').toHaveBeenWarned()
    // args no dynamic binding
    parse('<render :method="onRender" args="params"></render>', baseOptions)
    expect('<render> args should use a dynamic binding').toHaveBeenWarned()
  })

  it('slot tag single syntax', () => {
    const ast = parse('<slot></slot>', baseOptions)
    expect(ast.tag).toBe('slot')
    expect(ast.slotName).toBeUndefined()
  })

  it('slot tag namped syntax', () => {
    const ast = parse('<slot name="one">hello world</slot>', baseOptions)
    expect(ast.tag).toBe('slot')
    expect(ast.slotName).toBe('"one"')
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
    expect('Interpolation inside attributes has been deprecated').toHaveBeenWarned()
  })

  it('style binding', () => {
    const ast = parse('<p :style="error">hello world</p>', baseOptions)
    expect(ast.styleBinding).toBe('error')
  })

  it('transition', () => {
    const ast = parse('<p v-if="show" transition="expand">hello world</p>', baseOptions)
    expect(ast.transition).toBe('"expand"')
    expect(ast.transitionOnAppear).toBe(false)
  })

  it('transition with empty', () => {
    const ast = parse('<p v-if="show" transition="">hello world</p>', baseOptions)
    expect(ast.transition).toBe(true)
    expect(ast.transitionOnAppear).toBe(false)
  })

  it('attribute with v-bind', () => {
    const ast = parse('<input type="text" name="field1" :value="msg">', baseOptions)
    expect(ast.attrsList[0].name).toBe('type')
    expect(ast.attrsList[0].value).toBe('text')
    expect(ast.attrsList[1].name).toBe('name')
    expect(ast.attrsList[1].value).toBe('field1')
    expect(ast.attrsMap['type']).toBe('text')
    expect(ast.attrsMap['name']).toBe('field1')
    expect(ast.staticAttrs[0].name).toBe('type')
    expect(ast.staticAttrs[0].value).toBe('"text"')
    expect(ast.staticAttrs[1].name).toBe('name')
    expect(ast.staticAttrs[1].value).toBe('"field1"')
    expect(ast.props[0].name).toBe('value')
    expect(ast.props[0].value).toBe('msg')
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
    expect(ast1.staticAttrs[0].name).toBe('type')
    expect(ast1.staticAttrs[0].value).toBe('"text"')
    expect(ast1.staticAttrs[1].name).toBe('name')
    expect(ast1.staticAttrs[1].value).toBe('"field1"')
    expect(ast1.staticAttrs[2].name).toBe('value')
    expect(ast1.staticAttrs[2].value).toBe('"hello world"')
    // interpolation warning
    parse('<input type="text" name="field1" value="{{msg}}">', baseOptions)
    expect('Interpolation inside attributes has been deprecated').toHaveBeenWarned()
  })

  it('duplicate attribute', () => {
    parse('<p class="class1" class="class1">hello world</p>', baseOptions)
    expect('duplicate attribute').toHaveBeenWarned()
  })

  it('custom delimiter', () => {
    const ast = parse('<p>{msg}</p>', extend({ delimiters: ['{', '}'] }, baseOptions))
    expect(ast.children[0].expression).toBe('__toString__(msg)')
  })

  it('not specified getTagNamespace option', () => {
    const ast = parse('<svg><text>hello world</text></svg>', {
      expectHTML: true,
      preserveWhitespace: true,
      directives,
      isReservedTag,
      isUnaryTag,
      mustUseProp
    })
    expect(ast.tag).toBe('svg')
    expect(ast.ns).toBeUndefined()
  })

  it('not specified mustUseProp', () => {
    const ast = parse('<input type="text" name="field1" :value="msg">', {
      expectHTML: true,
      preserveWhitespace: true,
      directives,
      isReservedTag,
      isUnaryTag,
      getTagNamespace
    })
    expect(ast.props).toBeUndefined()
  })
})
