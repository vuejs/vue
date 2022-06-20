// API
export { parse } from './parse'
export { compileTemplate } from './compileTemplate'
export { compileStyle, compileStyleAsync } from './compileStyle'
export { compileScript } from './compileScript'
export { generateCodeFrame } from 'compiler/codeframe'
export { rewriteDefault } from './rewriteDefault'

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
