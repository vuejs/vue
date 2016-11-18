import { parse } from 'compiler/parser/index'
import { optimize } from 'compiler/optimizer'
import { generate } from 'compiler/codegen'
import { isObject } from 'shared/util'
import { isReservedTag } from 'web/util/index'
import { baseOptions } from 'web/compiler/index'

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

/* eslint-disable quotes */
describe('codegen', () => {
  it('generate directive', () => {
    assertCodegen(
      '<p v-custom1:arg1.modifier="value1" v-custom2><p>',
      `with(this){return _h('p',{directives:[{name:"custom1",rawName:"v-custom1:arg1.modifier",value:(value1),expression:"value1",arg:"arg1",modifiers:{"modifier":true}},{name:"custom2",rawName:"v-custom2",arg:"arg1"}]})}`
    )
  })

  it('generate filters', () => {
    assertCodegen(
      '<div :id="a | b | c">{{ d | e | f }}</div>',
      `with(this){return _h('div',{attrs:{"id":_f("c")(_f("b")(a))}},[_s(_f("f")(_f("e")(d)))])}`
    )
  })

  it('generate v-for directive', () => {
    assertCodegen(
      '<li v-for="item in items" :key="item.uid"></li>',
      `with(this){return _l((items),function(item){return _h('li',{key:item.uid})})}`
    )
    // iterator syntax
    assertCodegen(
      '<li v-for="(item, i) in items"></li>',
      `with(this){return _l((items),function(item,i){return _h('li')})}`
    )
    assertCodegen(
      '<li v-for="(item, key, index) in items"></li>',
      `with(this){return _l((items),function(item,key,index){return _h('li')})}`
    )
  })

  it('generate v-if directive', () => {
    assertCodegen(
      '<p v-if="show">hello</p>',
      `with(this){return (show)?_h('p',["hello"]):_e()}`
    )
  })

  it('generate v-else directive', () => {
    assertCodegen(
      '<div><p v-if="show">hello</p><p v-else>world</p></div>',
      `with(this){return _h('div',[(show)?_h('p',["hello"]):_h('p',["world"])])}`
    )
  })

  it('generate ref', () => {
    assertCodegen(
      '<p ref="component1"></p>',
      `with(this){return _h('p',{ref:"component1"})}`
    )
  })

  it('generate ref on v-for', () => {
    assertCodegen(
      '<ul><li v-for="item in items" ref="component1"></li></ul>',
      `with(this){return _h('ul',[_l((items),function(item){return _h('li',{ref:"component1",refInFor:true})})])}`
    )
  })

  it('generate v-bind directive', () => {
    assertCodegen(
      '<p v-bind="test"></p>',
      `with(this){return _h('p',_b({},'p',test))}`
    )
  })

  it('generate template tag', () => {
    assertCodegen(
      '<template><p>{{hello}}</p></template>',
      `with(this){return [_h('p',[_s(hello)])]}`
    )
  })

  it('generate single slot', () => {
    assertCodegen(
      '<slot></slot>',
      `with(this){return _t("default")}`
    )
  })

  it('generate named slot', () => {
    assertCodegen(
      '<slot name="one"></slot>',
      `with(this){return _t("one")}`
    )
  })

  it('generate slot fallback content', () => {
    assertCodegen(
      '<slot><div>hi</div></slot>',
      `with(this){return _t("default",[_h('div',["hi"])])}`
    )
  })

  it('generate slot target', () => {
    assertCodegen(
      '<p slot="one">hello world</p>',
      `with(this){return _h('p',{slot:"one"},["hello world"])}`
    )
  })

  it('generate class binding', () => {
    // static
    assertCodegen(
      '<p class="class1">hello world</p>',
      `with(this){return _h('p',{staticClass:"class1"},["hello world"])}`,
    )
    // dynamic
    assertCodegen(
      '<p :class="class1">hello world</p>',
      `with(this){return _h('p',{class:class1},["hello world"])}`
    )
  })

  it('generate style binding', () => {
    assertCodegen(
      '<p :style="error">hello world</p>',
      `with(this){return _h('p',{style:(error)},["hello world"])}`
    )
  })

  it('generate v-show directive', () => {
    assertCodegen(
      '<p v-show="shown">hello world</p>',
      `with(this){return _h('p',{directives:[{name:"show",rawName:"v-show",value:(shown),expression:"shown"}]},["hello world"])}`
    )
  })

  it('generate DOM props with v-bind directive', () => {
    // input + value
    assertCodegen(
      '<input :value="msg">',
      `with(this){return _h('input',{domProps:{"value":msg}})}`
    )
    // non input
    assertCodegen(
      '<p :value="msg">',
      `with(this){return _h('p',{attrs:{"value":msg}})}`
    )
  })

  it('generate attrs with v-bind directive', () => {
    assertCodegen(
      '<input :name="field1">',
      `with(this){return _h('input',{attrs:{"name":field1}})}`
    )
  })

  it('generate static attrs', () => {
    assertCodegen(
      '<input name="field1">',
      `with(this){return _h('input',{attrs:{"name":"field1"}})}`
    )
  })

  it('generate events with v-on directive', () => {
    assertCodegen(
      '<input @input="onInput">',
      `with(this){return _h('input',{on:{"input":onInput}})}`
    )
  })

  it('generate events with keycode', () => {
    assertCodegen(
      '<input @input.enter="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if($event.keyCode!==13)return;onInput($event)}}})}`
    )
    // multiple keycodes (delete)
    assertCodegen(
      '<input @input.delete="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if($event.keyCode!==8&&$event.keyCode!==46)return;onInput($event)}}})}`
    )
    // multiple keycodes (chained)
    assertCodegen(
      '<input @keydown.enter.delete="onInput">',
      `with(this){return _h('input',{on:{"keydown":function($event){if($event.keyCode!==13&&$event.keyCode!==8&&$event.keyCode!==46)return;onInput($event)}}})}`
    )
    // number keycode
    assertCodegen(
      '<input @input.13="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if($event.keyCode!==13)return;onInput($event)}}})}`
    )
    // custom keycode
    assertCodegen(
      '<input @input.custom="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if($event.keyCode!==_k("custom"))return;onInput($event)}}})}`
    )
  })

  it('generate events with modifiers', () => {
    assertCodegen(
      '<input @input.stop="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){$event.stopPropagation();onInput($event)}}})}`
    )
    assertCodegen(
      '<input @input.prevent="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){$event.preventDefault();onInput($event)}}})}`
    )
    assertCodegen(
      '<input @input.self="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if($event.target !== $event.currentTarget)return;onInput($event)}}})}`
    )
    assertCodegen(
      '<input @input.ctrl="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if(!$event.ctrlKey)return;onInput($event)}}})}`
    )
    assertCodegen(
      '<input @input.shift="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if(!$event.shiftKey)return;onInput($event)}}})}`
    )
    assertCodegen(
      '<input @input.alt="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if(!$event.altKey)return;onInput($event)}}})}`
    )
    assertCodegen(
      '<input @input.meta="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){if(!$event.metaKey)return;onInput($event)}}})}`
    )
  })

  it('generate events with multiple modifers', () => {
    assertCodegen(
      '<input @input.stop.prevent.self="onInput">',
      `with(this){return _h('input',{on:{"input":function($event){$event.stopPropagation();$event.preventDefault();if($event.target !== $event.currentTarget)return;onInput($event)}}})}`
    )
  })

  it('generate events with capture modifier', () => {
    assertCodegen(
      '<input @input.capture="onInput">',
      `with(this){return _h('input',{on:{"!input":function($event){onInput($event)}}})}`
    )
  })

  it('generate events with inline statement', () => {
    assertCodegen(
      '<input @input="curent++">',
      `with(this){return _h('input',{on:{"input":function($event){curent++}}})}`
    )
  })

  it('generate events with inline function expression', () => {
    // normal function
    assertCodegen(
      '<input @input="function () { current++ }">',
      `with(this){return _h('input',{on:{"input":function () { current++ }}})}`
    )
    // arrow with no args
    assertCodegen(
      '<input @input="()=>current++">',
      `with(this){return _h('input',{on:{"input":()=>current++}})}`
    )
    // arrow with parens, single arg
    assertCodegen(
      '<input @input="(e) => current++">',
      `with(this){return _h('input',{on:{"input":(e) => current++}})}`
    )
    // arrow with parens, multi args
    assertCodegen(
      '<input @input="(a, b, c) => current++">',
      `with(this){return _h('input',{on:{"input":(a, b, c) => current++}})}`
    )
    // arrow with destructuring
    assertCodegen(
      '<input @input="({ a, b }) => current++">',
      `with(this){return _h('input',{on:{"input":({ a, b }) => current++}})}`
    )
    // arrow single arg no parens
    assertCodegen(
      '<input @input="e=>current++">',
      `with(this){return _h('input',{on:{"input":e=>current++}})}`
    )
  })

  // #3893
  it('should not treat handler with unexpected whitespace as inline statement', () => {
    assertCodegen(
      '<input @input=" onInput ">',
      `with(this){return _h('input',{on:{"input": onInput }})}`
    )
  })

  it('generate unhandled events', () => {
    assertCodegen(
      '<input @input="curent++">',
      `with(this){return _h('input',{on:{"input":function(){}}})}`,
      ast => {
        ast.events.input = undefined
      }
    )
  })

  it('generate multiple event handlers', () => {
    assertCodegen(
      '<input @input="curent++" @input="onInput">',
      `with(this){return _h('input',{on:{"input":[function($event){curent++},onInput]}})}`
    )
  })

  it('generate component', () => {
    assertCodegen(
      '<my-component name="mycomponent1" :msg="msg" @notify="onNotify"><div>hi</div></my-component>',
      `with(this){return _h('my-component',{attrs:{"name":"mycomponent1","msg":msg},on:{"notify":onNotify}},[_h('div',["hi"])])}`
    )
  })

  it('generate svg component with children', () => {
    assertCodegen(
      '<svg><my-comp><circle :r="10"></circle></my-comp></svg>',
      `with(this){return _h('svg',[_h('my-comp',[_h('circle',{attrs:{"r":10}})])])}`
    )
  })

  it('generate is attribute', () => {
    assertCodegen(
      '<div is="component1"></div>',
      `with(this){return _h("component1",{tag:"div"})}`
    )
    assertCodegen(
      '<div :is="component1"></div>',
      `with(this){return _h(component1,{tag:"div"})}`
    )
  })

  it('generate component with inline-template', () => {
    // have "inline-template'"
    assertCodegen(
      '<my-component inline-template><p><span>hello world</span></p></my-component>',
      `with(this){return _h('my-component',{inlineTemplate:{render:function(){with(this){return _m(0)}},staticRenderFns:[function(){with(this){return _h('p',[_h('span',["hello world"])])}}]}})}`
    )
    // "have inline-template attrs, but not having extactly one child element
    assertCodegen(
      '<my-component inline-template><hr><hr></my-component>',
      `with(this){return _h('my-component',{inlineTemplate:{render:function(){with(this){return _h('hr')}},staticRenderFns:[]}})}`
    )
    expect('Inline-template components must have exactly one child element.').toHaveBeenWarned()
  })

  it('generate static trees inside v-for', () => {
    assertCodegen(
      `<div><div v-for="i in 10"><p><span></span></p></div></div>`,
      `with(this){return _h('div',[_l((10),function(i){return _h('div',[_m(0,true)])})])}`,
      [`with(this){return _h('p',[_h('span')])}`]
    )
  })

  it('not specified ast type', () => {
    const res = generate(null, baseOptions)
    expect(res.render).toBe(`with(this){return _h("div")}`)
    expect(res.staticRenderFns).toEqual([])
  })

  it('not specified directives option', () => {
    assertCodegen(
      '<p v-if="show">hello world</p>',
      `with(this){return (show)?_h('p',["hello world"]):_e()}`,
      { isReservedTag }
    )
  })
})
/* eslint-enable quotes */
