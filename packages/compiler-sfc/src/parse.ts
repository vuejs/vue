import { SourceMapGenerator } from 'source-map'
import { RawSourceMap, TemplateCompiler } from './types'
import {
  parseComponent,
  VueTemplateCompilerParseOptions,
  SFCDescriptor,
  DEFAULT_FILENAME
} from './parseComponent'

import hash from 'hash-sum'
import LRU from 'lru-cache'
import { hmrShouldReload } from './compileScript'
import { parseCssVars } from './cssVars'

const cache = new LRU<string, SFCDescriptor>(100)

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

export interface SFCParseOptions {
  source: string
  filename?: string
  compiler?: TemplateCompiler
  compilerParseOptions?: VueTemplateCompilerParseOptions
  sourceRoot?: string
  sourceMap?: boolean
  /**
   * @deprecated use `sourceMap` instead.
   */
  needMap?: boolean
}

export function parse(options: SFCParseOptions): SFCDescriptor {
  const {
    source,
    filename = DEFAULT_FILENAME,
    compiler,
    compilerParseOptions = { pad: false } as VueTemplateCompilerParseOptions,
    sourceRoot = '',
    needMap = true,
    sourceMap = needMap
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

  // parse CSS vars
  output.cssVars = parseCssVars(output)

  output.shouldForceReload = prevImports =>
    hmrShouldReload(prevImports, output!)

  if (sourceMap) {
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
