var _ = require('../util')
var Cache = require('../cache')
var expressionCache = new Cache(1000)

var wsRE = /\s/g
var newlineRE = /\n/g
var saveRE = /[\{,]\s*[\w\$_]+\s*:|'[^']*'|"[^"]*"/g
var restoreRE = /"(\d+)"/g
var pathRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
var keywords = 'Math,break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,undefined,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield'
var keywordsRE = new RegExp('^(' + keywords.replace(/,/g, '\\b|') + '\\b)')

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
var paths = []
var has = null

/**
 * Save replacer
 *
 * @param {String} str
 * @return {String} - placeholder with index
 */

function save (str) {
  var i = saved.length
  saved[i] = str.replace(newlineRE, '\\n')
  return '"' + i + '"'
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite (raw) {
  var c = raw.charAt(0)
  path = raw.slice(1)
  if (keywordsRE.test(path)) {
    return raw
  } else {
    path = path.replace(restoreRE, restore)
    if (!has[path]) {
      paths.push(path)
      has[path] = true
    }
    return c + 'scope.' + path
  }
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
 *
 * We isolate the try/catch so it doesn't affect the optimization
 * of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetter (body) {
  try {
    return new Function('scope', 'return ' + body + ';')
  } catch (e) {}
}

/**
 * Build a setter function.
 *
 * This is only needed in rare situations like "a[b]" where
 * a settable path requires dynamic evaluation.
 *
 * This setter function may throw error when called if the
 * expression body is not a valid left-hand expression in
 * assignment.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeSetter (body) {
  try {
    return new Function('scope', 'value', body + ' = value;')
  } catch (e) {}
}

/**
 * Parse an expression and rewrite into a getter/setter functions
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

exports.parse = function (exp, needSet) {
  // try cache
  var hit = expressionCache.get(exp)
  if (hit) {
    return hit
  }
  // reset state
  saved.length = 0
  paths.length = 0
  has = Object.create(null)
  // save strings and object literal keys
  var body = exp
    .replace(saveRE, save)
    .replace(wsRE, '')
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body)
    .replace(pathRE, rewrite)
    .replace(restoreRE, restore)
  // generate function
  var getter = makeGetter(body)
  if (getter) {
    getter.paths = paths.slice()
    if (needSet) {
      getter.setter = makeSetter(body)
    }
    expressionCache.put(exp, getter)
  } else {
    _.warn('Invalid expression: "' + exp + '"\nGenerated function body: ' + body)
  }
  return getter
}