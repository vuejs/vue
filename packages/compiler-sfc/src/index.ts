// API
export { parse } from './parse'
export { compileTemplate } from './compileTemplate'
export { compileStyle, compileStyleAsync } from './compileStyle'
export { compileScript } from './compileScript'
export { generateCodeFrame } from 'compiler/codeframe'

// types
export { SFCBlock, SFCCustomBlock, SFCDescriptor } from './parseComponent'
export {
  SFCTemplateCompileOptions,
  SFCTemplateCompileResult
} from './compileTemplate'
export { SFCStyleCompileOptions, SFCStyleCompileResults } from './compileStyle'
export { SFCScriptCompileOptions } from './compileScript'
