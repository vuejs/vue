/* @flow */

// import * as directives from './directives'
import { CodegenState } from 'compiler/codegen/index'

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
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns,
    stringRenderFns: state.stringRenderFns
  }
}

function genElement (el: ASTElement, state: SSRCodegenState): string {

}
