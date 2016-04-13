import { decodeHTML } from 'entities'
import HTMLParser from './html-parser'

/**
 * Convert HTML string to AST
 *
 * @param {String} template
 * @param {Boolean} preserveWhitespace
 * @return {Object}
 */

export function parse (template, preserveWhitespace) {
  let root
  let currentParent
  let stack = []
  HTMLParser(template, {
    html5: true,
    start (tag, attrs, unary) {
      let element = {
        tag,
        attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      }
      if (!root) {
        root = element
      } else if (process.env.NODE_ENV !== 'production' && !stack.length) {
        console.error(
          'Component template should contain exactly one root element:\n\n' + template
        )
      }
      if (currentParent) {
        currentParent.children.push(element)
      }
      if (!unary) {
        currentParent = element
        stack.push(element)
      }
    },
    end () {
      stack.length -= 1
      currentParent = stack[stack.length - 1]
    },
    chars (text) {
      if (!currentParent) {
        if (process.env.NODE_ENV !== 'production' && !root) {
          console.error(
            'Component template should contain exactly one root element:\n\n' + template
          )
        }
        return
      }
      text = currentParent.tag === 'pre'
        ? decodeHTML(text)
        : text.trim()
          ? decodeHTML(text)
          : preserveWhitespace
            ? ' '
            : null
      if (text) {
        currentParent.children.push(text)
      }
    }
  })
  return root
}

function makeAttrsMap (attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value
  }
  return map
}
