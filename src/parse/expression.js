var _ = require('../util')
var Path = require('./path')
var Cache = require('../cache')
var expressionCache = new Cache(1000)

var wsRE = /\s/g
var newlineRE = /\n/g
var saveRE = /[\{,]\s*[\w\$_]+\s*:|'[^']*'|"[^"]*"/g
var restoreRE = /"(\d+)"/g
var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*$/
var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
var keywords = 'Math,break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,undefined,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield'
var keywordsRE = new RegExp('^(' + keywords.replace(/,/g, '\\b|') + '\\b)')
// note the following two regexes are only used on valid paths
// so no need to exclude number for first char
var rootPathRE = /^[\w$]+/
var rootPathTestRE = /^[\w$]+$/

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
  var path = raw.slice(1)
  if (keywordsRE.test(path)) {
    return raw
  } else {
    path = path.indexOf('"') > -1
      ? path.replace(restoreRE, restore)
      : path
    if (!has[path]) {
      // we store root level paths e.g. "a"
      // so that the owner directive can add
      // them as default dependencies.
      if (rootPathTestRE.test(path)) {
        paths.push(path)
      }
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
 * Rewrite an expression, prefixing all path accessors with `scope.`
 * and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileExpFns (exp) {
  // reset state
  saved.length = 0
  paths = []
  has = Object.create(null)
  // save strings and object literal keys
  var body = exp
    .replace(saveRE, save)
    .replace(wsRE, '')
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body)
    .replace(pathReplaceRE, rewrite)
    .replace(restoreRE, restore)
  var getter = makeGetter(exp, body)
  if (getter) {
    getter.paths = paths
    getter.setter = makeSetter(body)
  }
  return getter
}

/**
 * Compile getter setters for a simple path.
 *
 * @param {String} exp
 * @return {Function}
 */

function compilePathFns (exp) {
  var getter, path
  if (exp.indexOf('[') < 0) {
    // really simple path
    path = exp.split('.')
    getter = Path.compileGetter(path)
  } else {
    // do the real parsing
    path = Path.parse(exp)
    getter = path.get
  }
  // save root path segment
  getter.paths = [exp.match(rootPathRE)[0]]
  getter.setter = function (obj, val) {
    Path.set(obj, path, val)
  }
  return getter
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

function makeGetter (exp, body) {
  try {
    return new Function('scope', 'return ' + body + ';')
  } catch (e) {
    _.warn('Invalid expression: "' + exp + '\nGenerated function body: ' + body)
  }
}

/**
 * Build a setter function.
 *
 * This is only needed in rare situations like "a[b]" where
 * a settable path requires dynamic evaluation.
 *
 * Not doing try-catch here because this only gets called
 * if makeGetter() worked.
 *
 * This setter function may throw error when called if the
 * expression body is not a valid left-hand expression in
 * assignment.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeSetter (body) {
  return new Function('scope', 'value', body + ' = value;')
}

/**
 * Parse an expression and rewrite into a getter/setter functions
 *
 * @param {String} exp
 * @return {Function}
 */

exports.parse = function (exp) {
  // try cache
  var hit = expressionCache.get(exp)
  if (hit) {
    return hit
  }
  exp = exp.trim()
  // we do a simple path check to optimize for that scenario.
  // the check fails valid paths with unusal whitespaces, but
  // that's too rare and we don't care.
  var getter = pathTestRE.test(exp)
    ? compilePathFns(exp)
    : compileExpFns(exp)
  expressionCache.put(exp, getter)
  return getter
}