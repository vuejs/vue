import Vue, { VNode } from "vue";
import {
  compile,
  compileToFunctions,
  ssrCompile,
  ssrCompileToFunctions,
  parseComponent
} from "./";

// check compile options
const compiled = compile("<div>hi</div>", {
  outputSourceRange: true,
  preserveWhitespace: false,
  whitespace: 'condense',
  modules: [
    {
      preTransformNode: el => el,
      transformNode: el => el,
      postTransformNode: el => {
        el.tag = "p";
      },
      genData: el => el.tag,
      transformCode: (el, code) => code,
      staticKeys: ["test"]
    }
  ],
  directives: {
    test: (node, directiveMeta) => {
      node.tag;
      directiveMeta.value;
    }
  }
});

// can be passed to function constructor
new Function(compiled.render);
compiled.staticRenderFns.map(fn => new Function(fn));

// with outputSourceRange: true
// errors should be objects with range
compiled.errors.forEach(e => {
  console.log(e.msg)
})

// without option or without outputSourceRange: true, should be strings
const { errors } = compile(`foo`)
errors.forEach(e => {
  console.log(e.length)
})

const { errors: errors2 } = compile(`foo`, {})
errors2.forEach(e => {
  console.log(e.length)
})

const { errors: errors3 } = compile(`foo`, {
  outputSourceRange: false
})
errors3.forEach(e => {
  console.log(e.length)
})

const compiledFns = compileToFunctions("<div>hi</div>");

// can be passed to component render / staticRenderFns options
const vm = new Vue({
  data() {
    return {
      test: "Test"
    };
  },
  render: compiledFns.render,
  staticRenderFns: compiledFns.staticRenderFns
});

// can be called with component instance
const vnode: VNode = compiledFns.render.call(vm);

// check SFC parser
const desc = parseComponent("<template></template>", {
  pad: "space"
});

const templateContent: string = desc.template!.content;
const scriptContent: string = desc.script!.content;
const styleContent: string = desc.styles.map(s => s.content).join("\n");
