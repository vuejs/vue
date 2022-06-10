import deindent from 'de-indent'
import { parseHTML } from 'compiler/parser/html-parser'
import { makeMap } from 'shared/util'
import { ASTAttr, WarningMessage } from 'types/compiler'
import { BindingMetadata, RawSourceMap } from './types'
import { hmrShouldReload, ImportBinding } from './compileScript'

const splitRE = /\r?\n/g
const replaceRE = /./g
const isSpecialTag = makeMap('script,style,template', true)

export interface SFCCustomBlock {
  type: string
  content: string
  attrs: { [key: string]: string | true }
  start: number
  end?: number
  map?: RawSourceMap
}

export interface SFCBlock extends SFCCustomBlock {
  lang?: string
  src?: string
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
  template: SFCBlock | null
  script: SFCScriptBlock | null
  scriptSetup: SFCScriptBlock | null
  styles: SFCBlock[]
  customBlocks: SFCCustomBlock[]
  errors: WarningMessage[]

  /**
   * compare with an existing descriptor to determine whether HMR should perform
   * a reload vs. re-render.
   *
   * Note: this comparison assumes the prev/next script are already identical,
   * and only checks the special case where <script setup lang="ts"> unused import
   * pruning result changes due to template changes.
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
  content: string,
  options: VueTemplateCompilerParseOptions = {}
): SFCDescriptor {
  const sfc: SFCDescriptor = {
    source: content,
    template: null,
    script: null,
    scriptSetup: null, // TODO
    styles: [],
    customBlocks: [],
    errors: [],
    shouldForceReload: prevImports => hmrShouldReload(prevImports, sfc)
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
        attrs: attrs.reduce((cumulated, { name, value }) => {
          cumulated[name] = value || true
          return cumulated
        }, {})
      }
      if (isSpecialTag(tag)) {
        checkAttrs(currentBlock, attrs)
        if (tag === 'style') {
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
      if (attr.name === 'src') {
        block.src = attr.value
      }
    }
  }

  function end(tag: string, start: number) {
    if (depth === 1 && currentBlock) {
      currentBlock.end = start
      let text = content.slice(currentBlock.start, currentBlock.end)
      if (options.deindent !== false) {
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
      return content.slice(0, block.start).replace(replaceRE, ' ')
    } else {
      const offset = content.slice(0, block.start).split(splitRE).length
      const padChar = block.type === 'script' && !block.lang ? '//\n' : '\n'
      return Array(offset).join(padChar)
    }
  }

  parseHTML(content, {
    warn,
    start,
    end,
    outputSourceRange: options.outputSourceRange
  })

  return sfc
}
