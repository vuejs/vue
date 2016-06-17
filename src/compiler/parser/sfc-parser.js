/* @flow */

// this file is used in the vue-template-compiler npm package
// and assumes its dependencies and a Node/CommonJS environment
import deindent from 'de-indent'
import { SourceMapGenerator } from 'source-map'

import { parseHTML } from './html-parser'
import { makeMap } from 'shared/util'

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/
const isSpecialTag = makeMap('script,style,template', true)

type Attribute = {
  name: string,
  value: string
}

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 */
export function parseComponent (
  content: string,
  options?: Object = {}
 ): SFCDescriptor {
  const sfc: SFCDescriptor = {
    template: null,
    script: null,
    styles: []
  }
  let depth = 0
  let currentBlock: ?SFCBlock = null

  function start (
    tag: string,
    attrs: Array<Attribute>,
    unary: boolean,
    start: number,
    end: number
  ) {
    if (isSpecialTag(tag) && depth === 0) {
      currentBlock = {
        type: tag,
        content: '',
        start: end
      }
      checkAttrs(currentBlock, attrs)
      if (tag === 'style') {
        sfc.styles.push(currentBlock)
      } else {
        sfc[tag] = currentBlock
      }
    }
    if (!unary) {
      depth++
    }
  }

  function checkAttrs (block: SFCBlock, attrs: Array<Attribute>) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.name === 'lang') {
        block.lang = attr.value
      }
      if (attr.name === 'scoped') {
        block.scoped = true
      }
      if (attr.name === 'src') {
        block.src = attr.value
      }
    }
  }

  function end (tag: string, start: number, end: number) {
    if (isSpecialTag(tag) && depth === 1 && currentBlock) {
      currentBlock.end = start
      let text = deindent(content.slice(currentBlock.start, currentBlock.end))
      // pad content so that linters and pre-processors can output correct
      // line numbers in errors and warnings
      if (currentBlock.type !== 'template' && options.pad) {
        text = padContent(currentBlock) + text
      }
      currentBlock.content = text
      if (options.map && !currentBlock.src) {
        addSourceMap(currentBlock)
      }
      currentBlock = null
    }
    depth--
  }

  function padContent (block: SFCBlock) {
    const padChar = block.type === 'script' && !block.lang
      ? '//\n'
      : '\n'
    return Array(getPaddingOffset(block) + 1).join(padChar)
  }

  function getPaddingOffset (block: SFCBlock) {
    return content.slice(0, block.start).split(splitRE).length - 1
  }

  function addSourceMap (block: SFCBlock) {
    const filename = options.map.filename
    /* istanbul ignore if */
    if (!filename) {
      throw new Error('Should provide original filename in the map option.')
    }
    const offset = options.pad ? 0 : getPaddingOffset(block)
    const map = new SourceMapGenerator()
    map.setSourceContent(filename, content)
    block.content.split(splitRE).forEach((line, index) => {
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
    block.map = JSON.parse(map.toString())
  }

  parseHTML(content, {
    start,
    end
  })

  return sfc
}
