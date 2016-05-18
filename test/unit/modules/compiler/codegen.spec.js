import { parse } from 'compiler/parser/index'
import { optimize } from 'compiler/optimizer'
import { generate } from 'compiler/codegen'
import directives from 'web/compiler/directives/index'
import { isReservedTag, isUnaryTag, mustUseProp, getTagNamespace } from 'web/util/index'
import { isObject } from 'shared/util'

/* eslint-disable quotes */
describe('codegen', () => {
  const baseOptions = {
    expectHTML: true,
    preserveWhitespace: true,
    directives,
    isReservedTag,
    isUnaryTag,
    mustUseProp,
    getTagNamespace
  }

  function assertCodegen (template, generatedCode, ...args) {
    let staticRenderFnCodes = []
    let generateOptions = baseOptions
    let proc = null
    let len = args.length
    while (len--) {
      const arg = args[len]
      if (Array.isArray(arg)) {
        staticRenderFnCodes = arg
      } else if (isObject(arg)) {
        generateOptions = arg
      } else if (typeof arg === 'function') {
        proc = arg
      }
    }

    const ast = parse(template, baseOptions)
    optimize(ast, baseOptions)
    proc && proc(ast)
    const res = generate(ast, generateOptions)
    expect(res.render).toBe(generatedCode)
    expect(res.staticRenderFns).toEqual(staticRenderFnCodes)
  }

  it('generate directive', () => {
    assertCodegen(
      '<p v-custom1:arg1.modifire="value1" v-custom2><p>',
      `with (this) { return __r__(__s__('p', {directives:[{name:"custom1",value:(value1),arg:"arg1",modifiers:{"modifire":true}},{name:"custom2",arg:"arg1"}]}), undefined)}`
    )
  })

  it('generate v-pre', () => {
    assertCodegen(
      '<div v-pre><p>hello world</p></div>',
      'with (this) { return __m__(0)}',
      [`with(this){return __r__(__s__('div', {pre:true}), [__r__(__s__('p', {}), [__t__("hello world")])])}`]
    )
  })

  it('generate v-for directive', () => {
    assertCodegen(
      '<li v-for="item in items" track-by="uid"></li>',
      `with (this) { return (items)&&__renderList__((items), function(item,$index,$key){return __r__(__s__('li', {key:uid}), undefined)})}`
    )
  })

  it('generate v-if directive', () => {
    assertCodegen(
      '<p v-if="show">hello</p>',
      `with (this) { return (show) ? __r__(__s__('p', undefined), [__t__("hello")]) : null}`
    )
  })

  it('generate v-else directive', () => {
    assertCodegen(
      '<div><p v-if="show">hello</p><p v-else>world</p></div>',
      `with (this) { return __r__(__s__('div', undefined), [(show) ? __r__(__s__('p', undefined), [__t__("hello")]) : __r__(__s__('p', undefined), [__t__("world")])])}`
    )
  })

  it('generate v-ref directive', () => {
    assertCodegen(
      '<p v-ref:component1></p>',
      `with (this) { return __r__(__s__('p', {hook:{"insert":function(n1,n2){__registerRef__("component1", n1.child || n1.elm, false), false},"destroy":function(n1,n2){__registerRef__("component1", n1.child || n1.elm, false, true)}}}), undefined)}`
    )
  })

  it('generate v-ref directive on v-for', () => {
    assertCodegen(
      '<ul><li v-for="item in items" v-ref:component1></li></ul>',
      `with (this) { return __r__(__s__('ul', undefined), [(items)&&__renderList__((items), function(item,$index,$key){return __r__(__s__('li', {hook:{"insert":function(n1,n2){__registerRef__("component1", n1.child || n1.elm, true), false},"destroy":function(n1,n2){__registerRef__("component1", n1.child || n1.elm, true, true)}}}), undefined)})])}`
    )
  })

  it('generate template tag', () => {
    assertCodegen(
      '<template><p>hello world</p></template>',
      `with (this) { return [__r__(__s__('p', undefined), [__t__("hello world")])]}`
    )
  })

  it('generate svg tag', () => {
    assertCodegen(
      '<svg><text>hello world</text></svg>',
      `with (this) { return __r__(__s__('svg', undefined,'svg'), function(){return [__r__(__s__('text', undefined,'svg'), function(){return [__t__("hello world")]})]})}`
    )
  })

  it('generate render tag', () => {
    assertCodegen(
      '<render :method="onRender" :args="params"></render>',
      `with (this) { return onRender(params,undefined)}`
    )
  })

  it('generate render tag that have childs', () => {
    assertCodegen(
      '<render :method="onRender"><p>hello</p></render>',
      `with (this) { return onRender(null,[__m__(0)])}`,
      [`with(this){return __r__(__s__('p', undefined), [__t__("hello")])}`]
    )
  })

  it('generate single slot', () => {
    assertCodegen(
      '<slot></slot>',
      `with (this) { return ($slots["default"] || undefined)}`
    )
  })

  it('generate named slot', () => {
    assertCodegen(
      '<slot name="one"></slot>',
      `with (this) { return ($slots["one"] || undefined)}`
    )
  })

  it('generate slot target', () => {
    assertCodegen(
      '<p slot="one">hello world</p>',
      `with (this) { return __r__(__s__('p', {slot:"one"}), [__t__("hello world")])}`
    )
  })

  it('generate class binding', () => {
    // static
    assertCodegen(
      '<p class="class1">hello world</p>',
      'with (this) { return __m__(0)}',
      [`with(this){return __r__(__s__('p', {staticAttrs:{"class":"class1"}}), [__t__("hello world")])}`]
    )
    // dynamic
    assertCodegen(
      '<p :class="class1">hello world</p>',
      `with (this) { return __r__(__s__('p', {attrs:{"class":class1}}), [__t__("hello world")])}`
    )
  })

  it('generate style binding', () => {
    assertCodegen(
      '<p :style="error">hello world</p>',
      `with (this) { return __r__(__s__('p', {attrs:{"style":error}}), [__t__("hello world")])}`
    )
  })

  it('generate transition', () => {
    assertCodegen(
      '<p transition="expand">hello world</p>',
      'with (this) { return __m__(0)}',
      [`with(this){return __r__(__s__('p', {staticAttrs:{"transition":"expand"}}), [__t__("hello world")])}`]
    )
  })

  it('generate v-show directive', () => {
    assertCodegen(
      '<p v-show="shown">hello world</p>',
      `with (this) { return __r__(__s__('p', {directives:[{name:"show",value:(shown)}],show:true}), [__t__("hello world")])}`
    )
  })

  it('generate props with v-bind directive', () => {
    assertCodegen(
      '<p :value="msg">',
      `with (this) { return __r__(__s__('p', {props:{"value":msg}}), undefined)}`
    )
  })

  it('generate attrs with v-bind directive', () => {
    assertCodegen(
      '<input :name="field1">',
      `with (this) { return __r__(__s__('input', {attrs:{"name":field1}}), undefined)}`
    )
  })

  it('generate staticAttrs', () => {
    assertCodegen(
      '<input name="field1">',
      `with (this) { return __m__(0)}`,
      [`with(this){return __r__(__s__('input', {staticAttrs:{"name":"field1"}}), undefined)}`]
    )
  })

  it('generate events with v-on directive', () => {
    assertCodegen(
      '<input @input="onInput">',
      `with (this) { return __r__(__s__('input', {on:{"input":onInput}}), undefined)}`
    )
    // keycode
    assertCodegen(
      '<input @input.enter="onInput">',
      `with (this) { return __r__(__s__('input', {on:{"input":function($event){if($event.keyCode!==13)return;onInput($event)}}}), undefined)}`
    )
    // multiple keycode
    assertCodegen(
      '<input @input.delete="onInput">',
      `with (this) { return __r__(__s__('input', {on:{"input":function($event){if($event.keyCode!==8&&$event.keyCode!==46)return;onInput($event)}}}), undefined)}`
    )
    // inline statement
    assertCodegen(
      '<input @input="curent++">',
      `with (this) { return __r__(__s__('input', {on:{"input":function($event){curent++}}}), undefined)}`
    )
    // unhandled
    assertCodegen(
      '<input @input="curent++">',
      `with (this) { return __r__(__s__('input', {on:{"input":function(){}}}), undefined)}`,
      ast => {
        ast.events.input = undefined
      }
    )
    // multiple handlers
    assertCodegen(
      '<input @input="curent++" @input="onInput">',
      `with (this) { return __r__(__s__('input', {on:{"input":[function($event){curent++},onInput]}}), undefined)}`
    )
  })

  it('generate component', () => {
    assertCodegen(
      '<my-component name="mycomponent1" :msg="msg" @notify="onNotify"></my-component>',
      `with (this) { return __r__(__s__('my-component', {attrs:{"msg":msg},staticAttrs:{"name":"mycomponent1"},on:{"notify":onNotify}}), undefined)}`
    )
    // have "is" attribute
    assertCodegen(
      '<my-component is="component1"></my-component>',
      `with (this) { return __r__(__s__("component1", {}), undefined)}`
    )
    // have "inline-template'"
    assertCodegen(
      '<my-component inline-template><p>hello world</p></my-component>',
      `with (this) { return __r__(__s__('my-component', {inlineTemplate:{render:function(){with (this) { return __m__(0)}},staticRenderFns:[function(){with(this){return __r__(__s__('p', undefined), [__t__("hello world")])}}]}}), undefined)}`
    )
    // "have inline-template attrs, and not have child
    assertCodegen(
      '<my-component inline-template><hr><hr></my-component>',
      `with (this) { return __r__(__s__('my-component', {inlineTemplate:{render:function(){with (this) { return __m__(0)}},staticRenderFns:[function(){with(this){return __r__(__s__('hr', undefined), undefined)}}]}}), undefined)}`
    )
    expect('Inline-template components must have exactly one child element.').toHaveBeenWarned()
  })

  it('not specified ast type', () => {
    const res = generate(null, baseOptions)
    expect(res.render).toBe(`with (this) { return __r__(__s__("div"))}`)
    expect(res.staticRenderFns).toEqual([])
  })

  it('not specified directives option', () => {
    assertCodegen(
      '<p v-if="show">hello world</p>',
      `with (this) { return (show) ? __r__(__s__('p', undefined), [__t__("hello world")]) : null}`,
      { isReservedTag }
    )
  })

  it('not specified isReservedTag option', () => {
    assertCodegen(
      '<div><p>hello world</p></div>',
      `with (this) { return __m__(0)}`,
      [`with(this){return __r__(__s__('div', undefined), function(){return [__r__(__s__('p', undefined), function(){return [__t__("hello world")]})]})}`],
      { directives }
    )
  })
})
/* eslint-enable quotes */
