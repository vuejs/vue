// API
export { parse } from './parse'
export { compileTemplate } from './compileTemplate'
export { compileStyle, compileStyleAsync } from './compileStyle'
export { compileScript } from './compileScript'
export { generateCodeFrame } from 'compiler/codeframe'

// types
export { SFCBlock, SFCCustomBlock, SFCDescriptor } from './parseComponent'
export {
  TemplateCompileOptions,
  TemplateCompileResult
} from './compileTemplate'
export { StyleCompileOptions, StyleCompileResults } from './compileStyle'
export { ScriptCompileOptions } from './compileScript'
