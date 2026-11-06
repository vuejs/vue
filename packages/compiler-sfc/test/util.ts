import {
  parse,
  compileScript,
  type SFCParseOptions,
  type SFCScriptCompileOptions
} from '../src'
import { parse as babelParse } from '@babel/parser'

export const mockId = 'xxxxxxxx'

export function compile(
  source: string,
  options?: Partial<SFCScriptCompileOptions>,
  parseOptions?: Partial<SFCParseOptions>
) {
  const sfc = parse({
    ...parseOptions,
    source
  })
  return compileScript(sfc, { id: mockId, ...options })
}

export function assertCode(code: string) {
  // parse the generated code to make sure it is valid
  try {
    babelParse(code, {
      sourceType: 'module',
      plugins: ['typescript']
    })
  } catch (e: any) {
    console.log(code)
    throw e
  }
  expect(code).toMatchSnapshot()
}
