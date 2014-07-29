var _ = require('../util')
var Cache = require('../cache')
var expressionCache = new Cache(1000)

function noop () {}

/**
 * Extract all accessor paths from an expression.
 *
 * @param {String} code
 * @return {Array} - extracted paths
 */

// remove strings and object literal keys that could contain arbitrary chars
var PREPARE_RE = /'[^']*'|"[^"]*"|[\{,]\s*[\w\$_]+\s*:/g
// turn anything that is not valid path char into commas
var CONVERT_RE = /[^\w$\.]+/g
// remove keywords & number literals
var KEYWORDS = 'Math,break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,undefined,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield'
var KEYWORDS_RE = new RegExp('\\b' + KEYWORDS.replace(/,/g, '\\b|\\b') + '\\b|\\b\\d[^,]*', 'g')
// remove trailing commas
var COMMA_RE = /^,+|,+$/
// split by commas
var SPLIT_RE = /,+/

function extractPaths (code) {
  code = code
    .replace(PREPARE_RE, ',')
    .replace(CONVERT_RE, ',')
    .replace(KEYWORDS_RE, '')
    .replace(COMMA_RE, '')
  return code
    ? code.split(SPLIT_RE)
    : []
}

/**
 * Escape leading dollar signs from paths for regex construction.
 *
 * @param {String} path
 * @return {String}
 */

function escapeDollar (path) {
  return path.charAt(0) === '$'
    ? '\\' + path
    : path
}

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is possible
 * for the same letter sequences to be found in strings and Object
 * literal property keys. Therefore we remove and store these
 * parts in a temporary array, and restore them after the path
 * rewrite.
 */

var saved = []
var NEWLINE_RE = /\n/g
var RESTORE_RE = /<%(\d+)%>/g

/**
 * Save replacer
 *
 * @param {String} str
 * @return {String} - placeholder with index
 */

function save (str) {
  var i = saved.length
  saved[i] = str.replace(NEWLINE_RE, '\\n')
  return '<%' + i + '%>'
}

/**
 * Path rewrite replacer
 *
 * @param {String} path
 * @return {String}
 */

function rewrite (path) {
  return path.charAt(0) + 'scope.' + path.slice(1)
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore (str, i) {
  return saved[i]
}

/**
 * Build a getter function. Requires eval.
 * We isolate the try/catch so it doesn't affect the optimization
 * of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function build (body) {
  try {
    return new Function('scope', body)
  } catch (e) {}
}

/**
 * Parse an expression and rewrite into a getter function
 *
 * @param {String} code
 * @return {Function}
 */

exports.parse = function (code) {
  // try cache
  var hit = expressionCache.get(code)
  if (hit) {
    return hit
  }
  // extract paths
  var paths = extractPaths(code)
  var body = 'return ' + code + ';'
  // rewrite paths
  if (paths.length) {
    var pathRE = new RegExp(
      '[^$\\w\\.](' +
      paths.map(escapeDollar).join('|') +
      ')[^$\\w\\.]',
      'g'
    )
    saved.length = 0
    body = body
      .replace(PREPARE_RE, save)
      .replace(pathRE, rewrite)
      .replace(RESTORE_RE, restore)
  }
  // generate function
  var fn = build(body)
  if (fn) {
    expressionCache.put(code, fn)
  } else {
    _.warn('Invalid expression: "' + code + '"\nGenerated function body: ' + body)
  }
  return fn || noop
}