import Cache from '../cache'
import config from '../config'
import { parseDirective } from '../parsers/directive'

const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
let cache, tagRE, htmlRE

/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex (str) {
  return str.replace(regexEscapeRE, '\\$&')
}

export function compileRegex () {
  var open = escapeRegex(config.delimiters[0])
  var close = escapeRegex(config.delimiters[1])
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0])
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1])
  tagRE = new RegExp(
    unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '|' +
    open + '((?:.|\\n)+?)' + close,
    'g'
  )
  htmlRE = new RegExp(
    '^' + unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '$'
  )
  // reset cache
  cache = new Cache(1000)
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

export function parseText (text) {
  if (!cache) {
    compileRegex()
  }
  var hit = cache.get(text)
  if (hit) {
    return hit
  }
  if (!tagRE.test(text)) {
    return null
  }
  var tokens = []
  var lastIndex = tagRE.lastIndex = 0
  var match, index, html, value, first, oneTime
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
  /* eslint-enable no-cond-assign */
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      })
    }
    // tag token
    html = htmlRE.test(match[0])
    value = html ? match[1] : match[2]
    first = value.charCodeAt(0)
    oneTime = first === 42 // *
    value = oneTime
      ? value.slice(1)
      : value
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    })
  }
  cache.put(text, tokens)
  return tokens
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

export function tokensToExp (tokens, vm) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token, vm)
    }).join('+')
  } else {
    return formatToken(tokens[0], vm, true)
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} [single]
 * @return {String}
 */

function formatToken (token, vm, single) {
  return token.tag
    ? token.oneTime && vm
      ? '"' + vm.$eval(token.value) + '"'
      : inlineFilters(token.value, single)
    : '"' + token.value + '"'
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/
function inlineFilters (exp, single) {
  if (!filterRE.test(exp)) {
    return single
      ? exp
      : '(' + exp + ')'
  } else {
    var dir = parseDirective(exp)
    if (!dir.filters) {
      return '(' + exp + ')'
    } else {
      return 'this._applyFilters(' +
        dir.expression + // value
        ',null,' +       // oldValue (null for read)
        JSON.stringify(dir.filters) + // filter descriptors
        ',false)'        // write?
    }
  }
}
