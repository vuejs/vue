/* @flow */

// The SSR codegen is essentially extending the default codegen to handle
// SSR-optimizable nodes and turn them into string render fns. In cases where
// a node is not optimizable it simply falls back to the default codegen.

// import * as directives from './directives'
import { CodegenState, genElement } from 'compiler/codegen/index'

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
  const code = ast ? genSSRElement(ast, state, true) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns,
    stringRenderFns: state.stringRenderFns
  }
}

function genSSRElement (
  el: ASTElement,
  state: SSRCodegenState,
  isComponentRoot?: boolean
): string {
  if (el.ssrOptimizableRoot && !isComponentRoot) {
    return genStringRenderFn(el, state)
  } else {
    return genElement(el, state)
  }
}

function genStringRenderFn (el, state) {
  return ''
}
