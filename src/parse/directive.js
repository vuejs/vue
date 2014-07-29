var Cache = require('../cache')
var cache = new Cache(1000)
var ARG_RE = /^[\w\$-]+$/
var FILTER_TOKEN_RE = /[^\s'"]+|'[^']+'|"[^"]+"/g

/**
 * Parser state
 */

var str
var c, i, l
var inSingle
var inDouble
var curly
var square
var paren
var begin
var argIndex
var dirs
var dir
var lastFilterIndex
var arg

/**
 * Push a directive object into the result Array
 */

function pushDir () {
  dir.raw = str.slice(begin, i).trim()
  if (dir.expression === undefined) {
    dir.expression = str.slice(argIndex, i).trim()
  } else if (lastFilterIndex !== begin) {
    pushFilter()
  }
  if (i === 0 || dir.expression) {
    dirs.push(dir)
  }
}

/**
 * Push a filter to the current directive object
 */

function pushFilter () {
  var exp = str.slice(lastFilterIndex, i).trim()
  var filter
  if (exp) {
    filter = {}
    var tokens = exp.match(FILTER_TOKEN_RE)
    filter.name = tokens[0]
    filter.args = tokens.length > 1 ? tokens.slice(1) : null
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter)
  }
  lastFilterIndex = i + 1
}

/**
 * Parse a directive string into an Array of AST-like objects
 * representing directives.
 *
 * @param {String} str
 * @return {Array<Object>}
 */

exports.parse = function (s) {

  var hit = cache.get(s)
  if (hit) {
    return hit
  }

  // reset parser state
  str = s
  inSingle = inDouble = false
  curly = square = paren = begin = argIndex = lastFilterIndex = 0
  dirs = []
  dir = {}
  arg = null

  for (i = 0, l = str.length; i < l; i++) {
    c = str.charAt(i)
    if (inSingle) {
      // check single quote
      if (c === "'") inSingle = !inSingle
    } else if (inDouble) {
      // check double quote
      if (c === '"') inDouble = !inDouble
    } else if (c === ',' && !paren && !curly && !square) {
      // reached the end of a directive
      pushDir()
      // reset & skip the comma
      dir = {}
      begin = argIndex = lastFilterIndex = i + 1
    } else if (c === ':' && !dir.expression && !dir.arg) {
      // argument
      arg = str.slice(begin, i).trim()
      if (ARG_RE.test(arg)) {
        argIndex = i + 1
        dir.arg = arg
      }
    } else if (c === '|' && str.charAt(i + 1) !== '|' && str.charAt(i - 1) !== '|') {
      if (dir.expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        dir.expression = str.slice(argIndex, i).trim()
      } else {
        // already has filter
        pushFilter()
      }
    } else {
      switch (c) {
        case '"': inDouble = true; break
        case "'": inSingle = true; break
        case '(': paren++; break
        case ')': paren--; break
        case '[': square++; break
        case ']': square--; break
        case '{': curly++; break
        case '}': curly--; break
      }
    }
  }

  if (i === 0 || begin !== i) {
    pushDir()
  }

  cache.put(s, dirs)
  return dirs
}