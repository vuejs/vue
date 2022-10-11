// API
export { parse } from './parse'
export { compileTemplate } from './compileTemplate'
export { compileStyle, compileStyleAsync } from './compileStyle'
export { compileScript } from './compileScript'
export { generateCodeFrame } from 'compiler/codeframe'
export { rewriteDefault } from './rewriteDefault'

// For backwards compat only. Some existing tools like
// fork-ts-checker-webpack-plugin relies on its presence for differentiating
// between Vue 2 and Vue 3.
// ref #12719
// ref https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/765
export { parseComponent } from './parseComponent'

// types
export { SFCParseOptions } from './parse'
export { CompilerOptions, WarningMessage } from 'types/compiler'
export { TemplateCompiler } from './types'
export {
  SFCBlock,
  SFCCustomBlock,
  SFCScriptBlock,
  SFCDescriptor
} from './parseComponent'
export {
  SFCTemplateCompileOptions,
  SFCTemplateCompileResults
} from './compileTemplate'
export { SFCStyleCompileOptions, SFCStyleCompileResults } from './compileStyle'
export { SFCScriptCompileOptions } from './compileScript'
