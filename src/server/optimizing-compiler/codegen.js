/* @flow */

// The SSR codegen is essentially extending the default codegen to handle
// SSR-optimizable nodes and turn them into string render fns. In cases where
// a node is not optimizable it simply falls back to the default codegen.

// import * as directives from './directives'
import { FULL, PARTIAL, CHILDREN } from './optimizer'

import {
  genIf,
  genFor,
  genData,
  genElement,
  genChildren,
  CodegenState
} from 'compiler/codegen/index'

type SSRCompileResult = {
  render: string;
  staticRenderFns: Array<string>;
  stringRenderFns: Array<string>;
};

class SSRCodegenState extends CodegenState {
  stringRenderFns: Array<string>;

  constructor (options: CompilerOptions) {
    super(options)
    this.stringRenderFns = []
  }
}

export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): SSRCompileResult {
  const state = new SSRCodegenState(options)
  const code = ast ? genSSRElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns,
    stringRenderFns: state.stringRenderFns
  }
}

function genSSRElement (el: ASTElement, state: SSRCodegenState): string {
  if (el.for && !el.forProcessed) {
    return genFor(el, state, genSSRElement)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state, genSSRElement)
  }

  switch (el.ssrOptimizability) {
    case FULL:
      // stringify whole tree
      return genStringNode(el, state, true)
    case PARTIAL:
      // stringify self and check children
      return genStringNode(el, state, false)
    case CHILDREN:
      // generate self as VNode and check children
      return genVNode(el, state)
    default:
      // bail whole tree
      return genElement(el, state)
  }
}

function genSSRNode (el, state) {
  return el.type === 1
    ? genSSRElement(el, state)
    : genStringNode(el, state)
}

function genSSRChildren (el, state, checkSkip) {
  return genChildren(el, state, checkSkip, genSSRElement, genSSRNode)
}

function genVNode (el, state) {
  let code
  const data = el.plain ? undefined : genData(el, state)
  const children = el.inlineTemplate ? null : genSSRChildren(el, state, true)
  code = `_c('${el.tag}'${
    data ? `,${data}` : '' // data
  }${
    children ? `,${children}` : '' // children
  })`
  // module transforms
  for (let i = 0; i < state.transforms.length; i++) {
    code = state.transforms[i](el, code)
  }
  return code
}

function genStringNode (el, state, includeChildren) {
  return '!!!'
}
