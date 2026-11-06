/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

import { makeMap, no } from 'shared/util'
import { isNonPhrasingTag } from 'web/compiler/util'
import { unicodeRegExp } from 'core/util/lang'
import { ASTAttr, CompilerOptions } from 'types/compiler'

// Regular Expressions for parsing tags and attributes
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute =
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
}
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) =>
  tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr(value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

// #10628: a `</script>` (or `</style>`) sequence inside a JS/CSS
// string, template literal, comment or regular expression must not
// terminate a plain-text block. The helpers below scan the raw text
// in a language-aware way and return the first closing tag that
// occurs in actual code context.
//
// If the scan reaches the end of input without finding a closing
// tag in code context, or encounters an unterminated string /
// comment / regex (i.e. the code is malformed), `null` is returned
// and the caller falls back to the historical "first closing tag"
// behaviour. This preserves error-recovery for invalid code and
// for non-JS contexts such as JSX text where a lone apostrophe
// would otherwise be mistaken for a string delimiter.

function matchPlainTextEndTag(html, index, tag) {
  // Returns index just after the `>` of a valid `</tag ...>` at
  // `index`, or -1. A valid end tag requires the tag name to be
  // followed by whitespace, `/` or `>` (HTML spec), so that e.g.
  // `</scriptfoo>` does not close a `<script>` block.
  if (html[index] !== '<' || html[index + 1] !== '/') {
    return -1
  }
  if (html.substr(index + 2, tag.length).toLowerCase() !== tag) {
    return -1
  }
  const after = index + 2 + tag.length
  if (after >= html.length) {
    return -1
  }
  const next = html[after]
  if (next !== '>' && next !== '/' && !/\s/.test(next)) {
    return -1
  }
  const gt = html.indexOf('>', after)
  if (gt < 0) {
    return -1
  }
  return gt + 1
}

function findPlainTextEnd(html, tag) {
  if (tag === 'script') {
    return findEndTagInScript(html, tag)
  }
  if (tag === 'style') {
    return findEndTagInStyle(html, tag)
  }
  // textarea and any other plain-text element: no string context,
  // the first valid closing tag terminates the block.
  let i = html.indexOf('<')
  while (i !== -1) {
    const tagEnd = matchPlainTextEndTag(html, i, tag)
    if (tagEnd !== -1) {
      return { textEnd: i, tagEnd }
    }
    i = html.indexOf('<', i + 1)
  }
  return null
}

// Keywords after which a `/` starts a regex literal rather than
// being a division operator.
const regexAllowedKeywords = {
  return: true,
  throw: true,
  case: true,
  delete: true,
  void: true,
  typeof: true,
  instanceof: true,
  in: true,
  of: true,
  new: true,
  yield: true,
  await: true,
  else: true,
  do: true
}

function findEndTagInScript(html, tag) {
  const stack: any[] = [
    { type: 'code', braceDepth: 0, interpolation: false }
  ]
  let canBeRegex = true
  let i = 0
  while (i < html.length) {
    const frame = stack[stack.length - 1]
    const c = html[i]
    const next = i + 1 < html.length ? html[i + 1] : ''

    if (frame.type === 'single' || frame.type === 'double') {
      const quote = frame.type === 'single' ? "'" : '"'
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === quote) {
        stack.pop()
        canBeRegex = false
        i++
        continue
      }
      // An unescaped newline cannot occur in a valid single /
      // double quoted string - bail out to the fallback.
      if (c === '\n' || c === '\r') {
        return null
      }
      i++
      continue
    }

    if (frame.type === 'template') {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === '`') {
        stack.pop()
        canBeRegex = false
        i++
        continue
      }
      if (c === '$' && next === '{') {
        stack.push({ type: 'code', braceDepth: 1, interpolation: true })
        canBeRegex = true
        i += 2
        continue
      }
      i++
      continue
    }

    if (frame.type === 'lineComment') {
      if (c === '\n' || c === '\r') {
        stack.pop()
        i++
        continue
      }
      i++
      continue
    }

    if (frame.type === 'blockComment') {
      if (c === '*' && next === '/') {
        stack.pop()
        i += 2
        continue
      }
      i++
      continue
    }

    if (frame.type === 'regex') {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === '[') {
        stack.push({ type: 'regexClass' })
        i++
        continue
      }
      if (c === '/') {
        stack.pop()
        canBeRegex = false
        i++
        // regex flags
        while (i < html.length && /[a-zA-Z]/.test(html[i])) {
          i++
        }
        continue
      }
      if (c === '\n' || c === '\r') {
        return null
      }
      i++
      continue
    }

    if (frame.type === 'regexClass') {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === ']') {
        stack.pop()
        i++
        continue
      }
      if (c === '\n' || c === '\r') {
        return null
      }
      i++
      continue
    }

    // code context - the only place a closing tag terminates
    // the block.
    if (c === '<') {
      const tagEnd = matchPlainTextEndTag(html, i, tag)
      if (tagEnd !== -1) {
        return { textEnd: i, tagEnd }
      }
      if (next === '/') {
        // `</...>` that is not the closing tag for this block
        // (e.g. a JSX closing tag, or `</scriptfoo>`). The `/`
        // is part of the tag-like sequence, not the start of a
        // regex literal or division operator, so consume both
        // characters without entering regex mode. Otherwise
        // `</scriptfoo>` would start a "regex" that swallows the
        // real closing tag.
        canBeRegex = true
        i += 2
        continue
      }
      canBeRegex = true
      i++
      continue
    }
    if (c === "'") {
      stack.push({ type: 'single' })
      i++
      continue
    }
    if (c === '"') {
      stack.push({ type: 'double' })
      i++
      continue
    }
    if (c === '`') {
      stack.push({ type: 'template' })
      i++
      continue
    }
    if (c === '/' && next === '/') {
      stack.push({ type: 'lineComment' })
      i += 2
      continue
    }
    if (c === '/' && next === '*') {
      stack.push({ type: 'blockComment' })
      i += 2
      continue
    }
    if (c === '/' && canBeRegex) {
      stack.push({ type: 'regex' })
      i++
      continue
    }
    if (c === '{') {
      frame.braceDepth++
      canBeRegex = true
      i++
      continue
    }
    if (c === '}') {
      if (frame.interpolation) {
        frame.braceDepth--
        if (frame.braceDepth === 0) {
          stack.pop()
          i++
          continue
        }
      }
      canBeRegex = true
      i++
      continue
    }
    if (/[A-Za-z_$]/.test(c) || c.charCodeAt(0) >= 128) {
      let j = i + 1
      while (
        j < html.length &&
        (/[\w$]/.test(html[j]) || html[j].charCodeAt(0) >= 128)
      ) {
        j++
      }
      const word = html.slice(i, j)
      canBeRegex = !!regexAllowedKeywords[word]
      i = j
      continue
    }
    if (/[0-9]/.test(c)) {
      let j = i + 1
      while (j < html.length && /[\w.]/.test(html[j])) {
        j++
      }
      canBeRegex = false
      i = j
      continue
    }
    if ((c === '+' || c === '-') && next === c) {
      // `++` / `--`: prefix vs postfix depends on the previous
      // token, so `canBeRegex` is intentionally left unchanged.
      i += 2
      continue
    }
    if (c === ')' || c === ']') {
      canBeRegex = false
      i++
      continue
    }
    if (/\s/.test(c)) {
      i++
      continue
    }
    // Any other punctuation / operator (including division `/`).
    // After such a token a regex literal may follow.
    canBeRegex = true
    i++
  }
  return null
}

function findEndTagInStyle(html, tag) {
  let mode = 'code'
  let quote = ''
  let i = 0
  while (i < html.length) {
    const c = html[i]
    const next = i + 1 < html.length ? html[i + 1] : ''

    if (mode === 'string') {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === quote) {
        mode = 'code'
        i++
        continue
      }
      if (c === '\n' || c === '\r') {
        return null
      }
      i++
      continue
    }

    if (mode === 'comment') {
      if (c === '*' && next === '/') {
        mode = 'code'
        i += 2
        continue
      }
      i++
      continue
    }

    // code context
    if (c === '<') {
      const tagEnd = matchPlainTextEndTag(html, i, tag)
      if (tagEnd !== -1) {
        return { textEnd: i, tagEnd }
      }
      i++
      continue
    }
    if (c === "'" || c === '"') {
      mode = 'string'
      quote = c
      i++
      continue
    }
    if (c === '/' && next === '*') {
      mode = 'comment'
      i += 2
      continue
    }
    i++
  }
  return null
}

export interface HTMLParserOptions extends CompilerOptions {
  start?: (
    tag: string,
    attrs: ASTAttr[],
    unary: boolean,
    start: number,
    end: number
  ) => void
  end?: (tag: string, start: number, end: number) => void
  chars?: (text: string, start?: number, end?: number) => void
  comment?: (content: string, start: number, end: number) => void
}

export function parseHTML(html, options: HTMLParserOptions) {
  const stack: any[] = []
  const expectHTML = options.expectHTML
  const isUnaryTag = options.isUnaryTag || no
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
  let index = 0
  let last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            if (options.shouldKeepComment && options.comment) {
              options.comment(
                html.substring(4, commentEnd),
                index,
                index + commentEnd + 3
              )
            }
            advance(commentEnd + 3)
            continue
          }
        }

        // https://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag:
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1)
          }
          continue
        }
      }

      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
      }

      if (textEnd < 0) {
        text = html
      }

      if (text) {
        advance(text.length)
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index)
      }
    } else {
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      let rest
      // #10628: prefer a language-aware search for the closing tag
      // so that `</script>` / `</style>` inside strings, template
      // literals, comments or regex literals do not truncate the
      // block. Fall back to the historical regex when the
      // language-aware scan cannot determine a closing tag (no
      // closing tag, or unterminated string/comment/regex).
      const plainTextEnd = findPlainTextEnd(html, stackedTag)
      if (plainTextEnd) {
        let text = html.slice(0, plainTextEnd.textEnd)
        const endTag = html.slice(plainTextEnd.textEnd, plainTextEnd.tagEnd)
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        if (options.chars) {
          options.chars(text)
        }
        rest = html.slice(plainTextEnd.tagEnd)
      } else {
        const reStackedTag =
          reCache[stackedTag] ||
          (reCache[stackedTag] = new RegExp(
            '([\\s\\S]*?)(</' + stackedTag + '[^>]*>)',
            'i'
          ))
        rest = html.replace(reStackedTag, function (all, text, endTag) {
          endTagLength = endTag.length
          if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
            text = text
              .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
              .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
          }
          if (shouldIgnoreFirstNewline(stackedTag, text)) {
            text = text.slice(1)
          }
          if (options.chars) {
            options.chars(text)
          }
          return ''
        })
      }
      index += html.length - rest.length
      html = rest
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (__DEV__ && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`, {
          start: index + html.length
        })
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance(n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match: any = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length)
      let end, attr
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(dynamicArgAttribute) || html.match(attribute))
      ) {
        attr.start = index
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag(match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs: ASTAttr[] = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines =
        tagName === 'a' && args[1] === 'href'
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
      if (__DEV__ && options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length
        attrs[i].end = args.end
      }
    }

    if (!unary) {
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(),
        attrs: attrs,
        start: match.start,
        end: match.end
      })
      lastTag = tagName
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag(tagName?: any, start?: any, end?: any) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if (__DEV__ && (i > pos || !tagName) && options.warn) {
          options.warn(`tag <${stack[i].tag}> has no matching end tag.`, {
            start: stack[i].start,
            end: stack[i].end
          })
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
