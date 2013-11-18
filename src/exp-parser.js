var utils = require('./utils'),
    hasOwn = Object.prototype.hasOwnProperty

// Variable extraction scooped from https://github.com/RubyLouvre/avalon

var KEYWORDS =
        // keywords
        'break,case,catch,continue,debugger,default,delete,do,else,false' +
        ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +
        ',throw,true,try,typeof,var,void,while,with,undefined' +
        // reserved
        ',abstract,boolean,byte,char,class,const,double,enum,export,extends' +
        ',final,float,goto,implements,import,int,interface,long,native' +
        ',package,private,protected,public,short,static,super,synchronized' +
        ',throws,transient,volatile' +
        // ECMA 5 - use strict
        ',arguments,let,yield',
        
    KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g'),
    REMOVE_RE   = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g,
    SPLIT_RE    = /[^\w$]+/g,
    NUMBER_RE   = /\b\d[^,]*/g,
    BOUNDARY_RE = /^,+|,+$/g

/**
 *  Strip top level variable names from a snippet of JS expression
 */
function getVariables (code) {
    code = code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
    return code
        ? code.split(/,+/)
        : []
}

/**
 *  A given path could potentially exist not on the
 *  current compiler, but up in the parent chain somewhere.
 *  This function generates an access relationship string
 *  that can be used in the getter function by walking up
 *  the parent chain to check for key existence.
 *
 *  It stops at top parent if no vm in the chain has the
 *  key. It then creates any missing bindings on the
 *  final resolved vm.
 */
function getRel (path, compiler) {
    var rel = '',
        vm  = compiler.vm,
        dot = path.indexOf('.'),
        key = dot > -1
            ? path.slice(0, dot)
            : path
    while (true) {
        if (hasOwn.call(vm, key)) {
            break
        } else {
            if (vm.$parent) {
                vm = vm.$parent
                rel += '$parent.'
            } else {
                break
            }
        }
    }
    compiler = vm.$compiler
    if (!hasOwn.call(compiler.bindings, path)) {
        compiler.createBinding(path)
    }
    return rel
}

/**
 *  Create a function from a string...
 *  this looks like evil magic but since all variables are limited
 *  to the VM's scope it's actually properly sandboxed
 */
function makeGetter (exp, raw) {
    /* jshint evil: true */
    var fn
    try {
        fn = new Function(exp)
    } catch (e) {
        utils.warn('Invalid expression: ' + raw)
    }
    return fn
}

module.exports = {

    /**
     *  Parse and return an anonymous computed property getter function
     *  from an arbitrary expression, together with a list of paths to be
     *  created as bindings.
     */
    parse: function (exp, compiler) {
        // extract variable names
        var vars = getVariables(exp)
        if (!vars.length) {
            return makeGetter('return ' + exp, exp)
        }
        vars = utils.unique(vars)
        var pathRE = new RegExp("\\b(" + vars.join('|') + ")[$\\w\\.]*\\b", 'g'),
            body   = 'return ' + exp.replace(pathRE, function (path) {
                return 'this.' + getRel(path, compiler) + path
            })
        return makeGetter(body, exp)
    }
}