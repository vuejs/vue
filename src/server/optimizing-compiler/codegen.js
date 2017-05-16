/* @flow */

// The SSR codegen is essentially extending the default codegen to handle
// SSR-optimizable nodes and turn them into string render fns. In cases where
// a node is not optimizable it simply falls back to the default codegen.

// import * as directives from './directives'
import { FULL, SELF, PARTIAL, CHILDREN } from './optimizer'

import {
  genIf,
  genFor,
  genData,
  genText,
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
      return genStringElement(el, state, true)
    case SELF:
      // stringify self and check children
      return genStringElement(el, state, false)
    case CHILDREN:
      // generate self as VNode and stringify children
      return genNormalElement(el, state, true)
    case PARTIAL:
      // generate self as VNode and check children
      return genNormalElement(el, state, false)
    default:
      // bail whole tree
      return genElement(el, state)
  }
}

function genSSRNode (el, state) {
  return el.type === 1
    ? genSSRElement(el, state)
    : genText(el, state)
}

function genSSRChildren (el, state, checkSkip) {
  return genChildren(el, state, checkSkip, genSSRElement, genSSRNode)
}

function genNormalElement (el, state, stringifyChildren) {
  const data = el.plain ? undefined : genData(el, state)
  const children = stringifyChildren
    ? genStringChildren(el, state)
    : genSSRChildren(el, state, true)
  return `_c('${el.tag}'${
    data ? `,${data}` : '' // data
  }${
    children ? `,${children}` : '' // children
  })`
}

function genStringElement (el, state, stringifyChildren) {
  return '"string element"'
}

function genStringChildren (el, state) {
  return '"string children"'
}
