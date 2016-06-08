/* @flow */

import { parseHTML } from './html-parser'
import { makeMap } from 'shared/util'
import deindent from 'de-indent'

const isSpecialTag = makeMap('script,style,template', true)

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 */
export function parseSFC (content: string): SFCDescriptor {
  const sfc: SFCDescriptor = {
    template: null,
    script: null,
    styles: []
  }
  let depth = 0
  let currentBlock

  function start (tag, attrs) {
    depth++
    if (depth > 1) {
      return
    }
    if (isSpecialTag(tag)) {
      const block: SFCBlock = currentBlock = {
        type: tag,
        content: ''
      }
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
      if (tag === 'style') {
        sfc.styles.push(block)
      } else {
        sfc[tag] = block
      }
    }
  }

  function end () {
    depth--
    currentBlock = null
  }

  function chars (text) {
    if (currentBlock) {
      currentBlock.content = deindent(text)
    }
  }

  parseHTML(content, {
    isSpecialTag,
    start,
    end,
    chars
  })

  return sfc
}
