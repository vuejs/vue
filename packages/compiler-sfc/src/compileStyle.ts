const postcss = require('postcss')
import { ProcessOptions, LazyResult } from 'postcss'
import trimPlugin from './stylePlugins/trim'
import scopedPlugin from './stylePlugins/scoped'
import {
  processors,
  StylePreprocessor,
  StylePreprocessorResults
} from './stylePreprocessors'
import { cssVarsPlugin } from './cssVars'

export interface SFCStyleCompileOptions {
  source: string
  filename: string
  id: string
  map?: any
  scoped?: boolean
  trim?: boolean
  preprocessLang?: string
  preprocessOptions?: any
  postcssOptions?: any
  postcssPlugins?: any[]
  isProd?: boolean
}

export interface SFCAsyncStyleCompileOptions extends SFCStyleCompileOptions {
  isAsync?: boolean
}

export interface SFCStyleCompileResults {
  code: string
  map: any | void
  rawResult: LazyResult | void
  errors: string[]
}

export function compileStyle(
  options: SFCStyleCompileOptions
): SFCStyleCompileResults {
  return doCompileStyle({ ...options, isAsync: false })
}

export function compileStyleAsync(
  options: SFCStyleCompileOptions
): Promise<SFCStyleCompileResults> {
  return Promise.resolve(doCompileStyle({ ...options, isAsync: true }))
}

export function doCompileStyle(
  options: SFCAsyncStyleCompileOptions
): SFCStyleCompileResults {
  const {
    filename,
    id,
    scoped = true,
    trim = true,
    isProd = false,
    preprocessLang,
    postcssOptions,
    postcssPlugins
  } = options
  const preprocessor = preprocessLang && processors[preprocessLang]
  const preProcessedSource = preprocessor && preprocess(options, preprocessor)
  const map = preProcessedSource ? preProcessedSource.map : options.map
  const source = preProcessedSource ? preProcessedSource.code : options.source

  const plugins = (postcssPlugins || []).slice()
  plugins.unshift(cssVarsPlugin({ id: id.replace(/^data-v-/, ''), isProd }))
  if (trim) {
    plugins.push(trimPlugin())
  }
  if (scoped) {
    plugins.push(scopedPlugin(id))
  }

  const postCSSOptions: ProcessOptions = {
    ...postcssOptions,
    to: filename,
    from: filename
  }
  if (map) {
    postCSSOptions.map = {
      inline: false,
      annotation: false,
      prev: map
    }
  }

  let result, code, outMap
  const errors: any[] = []
  if (preProcessedSource && preProcessedSource.errors.length) {
    errors.push(...preProcessedSource.errors)
  }
  try {
    result = postcss(plugins).process(source, postCSSOptions)

    // In async mode, return a promise.
    if (options.isAsync) {
      return result
        .then(
          (result: LazyResult): SFCStyleCompileResults => ({
            code: result.css || '',
            map: result.map && result.map.toJSON(),
            errors,
            rawResult: result
          })
        )
        .catch(
          (error: Error): SFCStyleCompileResults => ({
            code: '',
            map: undefined,
            errors: [...errors, error.message],
            rawResult: undefined
          })
        )
    }

    // force synchronous transform (we know we only have sync plugins)
    code = result.css
    outMap = result.map
  } catch (e) {
    errors.push(e)
  }

  return {
    code: code || ``,
    map: outMap && outMap.toJSON(),
    errors,
    rawResult: result
  }
}

function preprocess(
  options: SFCStyleCompileOptions,
  preprocessor: StylePreprocessor
): StylePreprocessorResults {
  return preprocessor(
    options.source,
    options.map,
    Object.assign(
      {
        filename: options.filename
      },
      options.preprocessOptions
    )
  )
}
