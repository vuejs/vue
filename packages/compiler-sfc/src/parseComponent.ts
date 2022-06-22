import deindent from 'de-indent'
import { parseHTML } from 'compiler/parser/html-parser'
import { makeMap } from 'shared/util'
import { ASTAttr, WarningMessage } from 'types/compiler'
import { BindingMetadata, RawSourceMap } from './types'
import type { ImportBinding } from './compileScript'

export const DEFAULT_FILENAME = 'anonymous.vue'

const splitRE = /\r?\n/g
const replaceRE = /./g
const isSpecialTag = makeMap('script,style,template', true)

export interface SFCCustomBlock {
  type: string
  content: string
  attrs: { [key: string]: string | true }
  start: number
  end: number
  src?: string
  map?: RawSourceMap
}

export interface SFCBlock extends SFCCustomBlock {
  lang?: string
  scoped?: boolean
  module?: string | boolean
}

export interface SFCScriptBlock extends SFCBlock {
  type: 'script'
  setup?: string | boolean
  bindings?: BindingMetadata
  imports?: Record<string, ImportBinding>
  /**
   * import('\@babel/types').Statement
   */
  scriptAst?: any[]
  /**
   * import('\@babel/types').Statement
   */
  scriptSetupAst?: any[]
}

export interface SFCDescriptor {
  source: string
  filename: string
  template: SFCBlock | null
  script: SFCScriptBlock | null
  scriptSetup: SFCScriptBlock | null
  styles: SFCBlock[]
  customBlocks: SFCCustomBlock[]
  cssVars: string[]

  errors: (string | WarningMessage)[]

  /**
   * compare with an existing descriptor to determine whether HMR should perform
   * a reload vs. re-render.
   *
   * Note: this comparison assumes the prev/next script are already identical,
   * and only checks the special case where `<script setup lang="ts">` unused
   * import pruning result changes due to template changes.
   */
  shouldForceReload: (prevImports: Record<string, ImportBinding>) => boolean
}

export interface VueTemplateCompilerParseOptions {
  pad?: 'line' | 'space' | boolean
  deindent?: boolean
  outputSourceRange?: boolean
}

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 */
export function parseComponent(
  source: string,
  options: VueTemplateCompilerParseOptions = {}
): SFCDescriptor {
  const sfc: SFCDescriptor = {
    source,
    filename: DEFAULT_FILENAME,
    template: null,
    script: null,
    scriptSetup: null, // TODO
    styles: [],
    customBlocks: [],
    cssVars: [],
    errors: [],
    shouldForceReload: null as any // attached in parse() by compiler-sfc
  }
  let depth = 0
  let currentBlock: SFCBlock | null = null

  let warn: any = msg => {
    sfc.errors.push(msg)
  }

  if (__DEV__ && options.outputSourceRange) {
    warn = (msg, range) => {
      const data: WarningMessage = { msg }
      if (range.start != null) {
        data.start = range.start
      }
      if (range.end != null) {
        data.end = range.end
      }
      sfc.errors.push(data)
    }
  }

  function start(
    tag: string,
    attrs: ASTAttr[],
    unary: boolean,
    start: number,
    end: number
  ) {
    if (depth === 0) {
      currentBlock = {
        type: tag,
        content: '',
        start: end,
        end: 0, // will be set on tag close
        attrs: attrs.reduce((cumulated, { name, value }) => {
          cumulated[name] = value || true
          return cumulated
        }, {})
      }

      if (typeof currentBlock.attrs.src === 'string') {
        currentBlock.src = currentBlock.attrs.src
      }

      if (isSpecialTag(tag)) {
        checkAttrs(currentBlock, attrs)
        if (tag === 'script') {
          const block = currentBlock as SFCScriptBlock
          if (block.attrs.setup) {
            block.setup = currentBlock.attrs.setup
            sfc.scriptSetup = block
          } else {
            sfc.script = block
          }
        } else if (tag === 'style') {
          sfc.styles.push(currentBlock)
        } else {
          sfc[tag] = currentBlock
        }
      } else {
        // custom blocks
        sfc.customBlocks.push(currentBlock)
      }
    }
    if (!unary) {
      depth++
    }
  }

  function checkAttrs(block: SFCBlock, attrs: ASTAttr[]) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.name === 'lang') {
        block.lang = attr.value
      }
      if (attr.name === 'scoped') {
        block.scoped = true
      }
      if (attr.name === 'module') {
        block.module = attr.value || true
      }
    }
  }

  function end(tag: string, start: number) {
    if (depth === 1 && currentBlock) {
      currentBlock.end = start
      let text = source.slice(currentBlock.start, currentBlock.end)
      if (options.deindent) {
        text = deindent(text)
      }
      // pad content so that linters and pre-processors can output correct
      // line numbers in errors and warnings
      if (currentBlock.type !== 'template' && options.pad) {
        text = padContent(currentBlock, options.pad) + text
      }
      currentBlock.content = text
      currentBlock = null
    }
    depth--
  }

  function padContent(block: SFCBlock, pad: true | 'line' | 'space') {
    if (pad === 'space') {
      return source.slice(0, block.start).replace(replaceRE, ' ')
    } else {
      const offset = source.slice(0, block.start).split(splitRE).length
      const padChar = block.type === 'script' && !block.lang ? '//\n' : '\n'
      return Array(offset).join(padChar)
    }
  }

  parseHTML(source, {
    warn,
    start,
    end,
    outputSourceRange: options.outputSourceRange
  })

  return sfc
}
