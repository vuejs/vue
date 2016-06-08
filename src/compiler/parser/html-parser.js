/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

import { decodeHTML } from 'entities'
import { makeMap, no } from 'shared/util'
import { isNonPhrasingTag, canBeLeftOpenTag } from 'web/util/index'

// Regular Expressions for parsing tags and attributes
const singleAttrIdentifier = /([^\s"'<>\/=]+)/
const singleAttrAssign = /=/
const singleAttrAssigns = [singleAttrAssign]
const singleAttrValues = [
  // attr value double quotes
  /"([^"]*)"+/.source,
  // attr value, single quotes
  /'([^']*)'+/.source,
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source
]
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
const startTagOpen = new RegExp('^<' + qnameCapture)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>')
const doctype = /^<!DOCTYPE [^>]+>/i

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
const special = makeMap('script,style', true)

const reCache = {}

function attrForHandler (handler) {
  const pattern = singleAttrIdentifier.source +
    '(?:\\s*(' + joinSingleAttrAssigns(handler) + ')' +
    '\\s*(?:' + singleAttrValues.join('|') + '))?'
  return new RegExp('^\\s*' + pattern)
}

function joinSingleAttrAssigns (handler) {
  return singleAttrAssigns.map(function (assign) {
    return '(?:' + assign.source + ')'
  }).join('|')
}

export function parseHTML (html, handler) {
  const stack = []
  const attribute = attrForHandler(handler)
  const expectHTML = handler.expectHTML
  const isUnaryTag = handler.isUnaryTag || no
  const isSpecialTag = handler.isSpecialTag || special
  let last, prevTag, nextTag, lastTag
  while (html) {
    last = html
    // Make sure we're not in a script or style element
    if (!lastTag || !isSpecialTag(lastTag)) {
      const textEnd = html.indexOf('<')
      if (textEnd === 0) {
        // Comment:
        if (/^<!--/.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            html = html.substring(commentEnd + 3)
            prevTag = ''
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (/^<!\[/.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            html = html.substring(conditionalEnd + 2)
            prevTag = ''
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          if (handler.doctype) {
            handler.doctype(doctypeMatch[0])
          }
          html = html.substring(doctypeMatch[0].length)
          prevTag = ''
          continue
        }

        // End tag:
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          html = html.substring(endTagMatch[0].length)
          endTagMatch[0].replace(endTag, parseEndTag)
          prevTag = '/' + endTagMatch[1].toLowerCase()
          continue
        }

        // Start tag:
        const startTagMatch = parseStartTag(html)
        if (startTagMatch) {
          html = startTagMatch.rest
          handleStartTag(startTagMatch)
          prevTag = startTagMatch.tagName.toLowerCase()
          continue
        }
      }

      let text
      if (textEnd >= 0) {
        text = html.substring(0, textEnd)
        html = html.substring(textEnd)
      } else {
        text = html
        html = ''
      }

      // next tag
      let nextTagMatch = parseStartTag(html)
      if (nextTagMatch) {
        nextTag = nextTagMatch.tagName
      } else {
        nextTagMatch = html.match(endTag)
        if (nextTagMatch) {
          nextTag = '/' + nextTagMatch[1]
        } else {
          nextTag = ''
        }
      }

      if (handler.chars) {
        handler.chars(text, prevTag, nextTag)
      }
      prevTag = ''
    } else {
      const stackedTag = lastTag.toLowerCase()
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)</' + stackedTag + '[^>]*>', 'i'))

      html = html.replace(reStackedTag, function (all, text) {
        if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        }
        if (handler.chars) {
          handler.chars(text)
        }
        return ''
      })

      parseEndTag('</' + stackedTag + '>', stackedTag)
    }

    if (html === last) {
      throw new Error('Error parsing template:\n\n' + html)
    }
  }

  if (!handler.partialMarkup) {
    // Clean up any remaining tags
    parseEndTag()
  }

  function parseStartTag (input) {
    const start = input.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      input = input.slice(start[0].length)
      let end, attr
      while (!(end = input.match(startTagClose)) && (attr = input.match(attribute))) {
        input = input.slice(attr[0].length)
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        match.rest = input.slice(end[0].length)
        return match
      }
    }
  }

  function handleStartTag (match) {
    const tagName = match.tagName
    let unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag('', lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag('', tagName)
      }
    }

    const unary = isUnaryTag(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3] }
        if (args[4] === '') { delete args[4] }
        if (args[5] === '') { delete args[5] }
      }
      attrs[i] = {
        name: args[1],
        value: decodeHTML(args[3] || args[4] || args[5] || '')
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, attrs: attrs })
      lastTag = tagName
      unarySlash = ''
    }

    if (handler.start) {
      handler.start(tagName, attrs, unary, unarySlash)
    }
  }

  function parseEndTag (tag, tagName) {
    let pos

    // Find the closest opened tag of the same type
    if (tagName) {
      const needle = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].tag.toLowerCase() === needle) {
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
        if (handler.end) {
          handler.end(stack[i].tag, stack[i].attrs, i > pos || !tag)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (tagName.toLowerCase() === 'br') {
      if (handler.start) {
        handler.start(tagName, [], true, '')
      }
    } else if (tagName.toLowerCase() === 'p') {
      if (handler.start) {
        handler.start(tagName, [], false, '', true)
      }
      if (handler.end) {
        handler.end(tagName, [])
      }
    }
  }
}
