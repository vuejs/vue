import { SourceMapGenerator } from 'source-map'
import { RawSourceMap, VueTemplateCompiler } from './types'
import {
  parseComponent,
  VueTemplateCompilerParseOptions,
  SFCDescriptor,
  DEFAULT_FILENAME
} from './parseComponent'

import hash from 'hash-sum'
import LRU from 'lru-cache'
import { hmrShouldReload } from './compileScript'

const cache = new LRU<string, SFCDescriptor>(100)

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

export interface ParseOptions {
  source: string
  filename?: string
  compiler?: VueTemplateCompiler
  compilerParseOptions?: VueTemplateCompilerParseOptions
  sourceRoot?: string
  needMap?: boolean
}

export function parse(options: ParseOptions): SFCDescriptor {
  const {
    source,
    filename = DEFAULT_FILENAME,
    compiler,
    compilerParseOptions = { pad: false } as VueTemplateCompilerParseOptions,
    sourceRoot = '',
    needMap = true
  } = options
  const cacheKey = hash(
    filename + source + JSON.stringify(compilerParseOptions)
  )

  let output = cache.get(cacheKey)
  if (output) {
    return output
  }

  if (compiler) {
    // user-provided compiler
    output = compiler.parseComponent(source, compilerParseOptions)
  } else {
    // use built-in compiler
    output = parseComponent(source, compilerParseOptions)
  }

  output.filename = filename
  output.shouldForceReload = prevImports =>
    hmrShouldReload(prevImports, output!)

  if (needMap) {
    if (output.script && !output.script.src) {
      output.script.map = generateSourceMap(
        filename,
        source,
        output.script.content,
        sourceRoot,
        compilerParseOptions.pad
      )
    }
    if (output.styles) {
      output.styles.forEach(style => {
        if (!style.src) {
          style.map = generateSourceMap(
            filename,
            source,
            style.content,
            sourceRoot,
            compilerParseOptions.pad
          )
        }
      })
    }
  }

  cache.set(cacheKey, output)
  return output
}

function generateSourceMap(
  filename: string,
  source: string,
  generated: string,
  sourceRoot: string,
  pad?: 'line' | 'space' | boolean
): RawSourceMap {
  const map = new SourceMapGenerator({
    file: filename.replace(/\\/g, '/'),
    sourceRoot: sourceRoot.replace(/\\/g, '/')
  })
  let offset = 0
  if (!pad) {
    offset = source.split(generated).shift()!.split(splitRE).length - 1
  }
  map.setSourceContent(filename, source)
  generated.split(splitRE).forEach((line, index) => {
    if (!emptyRE.test(line)) {
      map.addMapping({
        source: filename,
        original: {
          line: index + 1 + offset,
          column: 0
        },
        generated: {
          line: index + 1,
          column: 0
        }
      })
    }
  })
  return JSON.parse(map.toString())
}
