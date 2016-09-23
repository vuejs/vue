import { toNumber, stripQuotes } from '../util/index'
import Cache from '../cache'

const cache = new Cache(1000)
const reservedArgRE = /^in$|^-?\d+/

/**
 * Parser state
 */

var str, dir, len
var index
var chr
var state
var startState = 0
var filterState = 1
var filterNameState = 2
var filterArgState = 3

var doubleChr = 0x22
var singleChr = 0x27
var pipeChr = 0x7C
var escapeChr = 0x5C
var spaceChr = 0x20

var expStartChr = { 0x5B: 1, 0x7B: 1, 0x28: 1 }
var expChrPair = { 0x5B: 0x5D, 0x7B: 0x7D, 0x28: 0x29 }

function peek () {
  return str.charCodeAt(index + 1)
}

function next () {
  return str.charCodeAt(++index)
}

function eof () {
  return index >= len
}

function eatSpace () {
  while (peek() === spaceChr) {
    next()
  }
}

function isStringStart (chr) {
  return chr === doubleChr || chr === singleChr
}

function isExpStart (chr) {
  return expStartChr[chr]
}

function isExpEnd (start, chr) {
  return expChrPair[start] === chr
}

function parseString () {
  var stringQuote = next()
  var chr
  while (!eof()) {
    chr = next()
    // escape char
    if (chr === escapeChr) {
      next()
    } else if (chr === stringQuote) {
      break
    }
  }
}

function parseSpecialExp (chr) {
  var inExp = 0
  var startChr = chr

  while (!eof()) {
    chr = peek()
    if (isStringStart(chr)) {
      parseString()
      continue
    }

    if (startChr === chr) {
      inExp++
    }
    if (isExpEnd(startChr, chr)) {
      inExp--
    }

    next()

    if (inExp === 0) {
      break
    }
  }
}

/**
 * syntax:
 * expression | filterName  [arg  arg [| filterName arg arg]]
 */

function parseExpression () {
  var start = index
  while (!eof()) {
    chr = peek()
    if (isStringStart(chr)) {
      parseString()
    } else if (isExpStart(chr)) {
      parseSpecialExp(chr)
    } else if (chr === pipeChr) {
      next()
      chr = peek()
      if (chr === pipeChr) {
        next()
      } else {
        if (state === startState || state === filterArgState) {
          state = filterState
        }
        break
      }
    } else if (chr === spaceChr && (state === filterNameState || state === filterArgState)) {
      eatSpace()
      break
    } else {
      if (state === filterState) {
        state = filterNameState
      }
      next()
    }
  }

  return str.slice(start + 1, index) || null
}

function parseFilterList () {
  var filters = []
  while (!eof()) {
    filters.push(parseFilter())
  }
  return filters
}

function parseFilter () {
  var filter = {}
  var args

  state = filterState
  filter.name = parseExpression().trim()

  state = filterArgState
  args = parseFilterArguments()

  if (args.length) {
    filter.args = args
  }
  return filter
}

function parseFilterArguments () {
  var args = []
  while (!eof() && state !== filterState) {
    var arg = parseExpression()
    if (!arg) {
      break
    }
    args.push(processFilterArg(arg))
  }

  return args
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg (arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    }
  } else {
    var stripped = stripQuotes(arg)
    var dynamic = stripped === arg
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    }
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} s
 * @return {Object}
 */

export function parseDirective (s) {
  var hit = cache.get(s)
  if (hit) {
    return hit
  }

  // reset parser state
  str = s
  dir = {}
  len = str.length
  index = -1
  chr = ''
  state = startState

  var filters

  if (str.indexOf('|') < 0) {
    dir.expression = str.trim()
  } else {
    dir.expression = parseExpression().trim()
    filters = parseFilterList()
    if (filters.length) {
      dir.filters = filters
    }
  }

  cache.put(s, dir)
  return dir
}
