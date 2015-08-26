module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var parse = __webpack_require__(1).parse
	var hoist = __webpack_require__(2)

	var InfiniteChecker = __webpack_require__(3)
	var Primitives = __webpack_require__(4)

	module.exports = safeEval
	module.exports.eval = safeEval
	module.exports.FunctionFactory = FunctionFactory
	module.exports.Function = FunctionFactory()

	var maxIterations = 1000000

	// 'eval' with a controlled environment
	function safeEval(src, parentContext){
	  var tree = prepareAst(src)
	  var context = Object.create(parentContext || {})
	  return finalValue(evaluateAst(tree, context))
	}

	// create a 'Function' constructor for a controlled environment
	function FunctionFactory(parentContext){
	  var context = Object.create(parentContext || {})
	  return function Function() {
	    // normalize arguments array
	    var args = Array.prototype.slice.call(arguments)
	    var src = args.slice(-1)[0]
	    args = args.slice(0,-1)
	    if (typeof src === 'string'){
	      //HACK: esprima doesn't like returns outside functions
	      src = parse('function a(){' + src + '}').body[0].body
	    }
	    var tree = prepareAst(src)
	    return getFunction(tree, args, context)
	  }
	}

	// takes an AST or js source and returns an AST
	function prepareAst(src){
	  var tree = (typeof src === 'string') ? parse(src) : src
	  return hoist(tree)
	}

	// evaluate an AST in the given context
	function evaluateAst(tree, context){

	  var safeFunction = FunctionFactory(context)
	  var primitives = Primitives(context)

	  // block scoped context for catch (ex) and 'let'
	  var blockContext = context

	  return walk(tree)

	  // recursively walk every node in an array
	  function walkAll(nodes){
	    var result = undefined
	    for (var i=0;i<nodes.length;i++){
	      var childNode = nodes[i]
	      if (childNode.type === 'EmptyStatement') continue
	      result = walk(childNode)
	      if (result instanceof ReturnValue){
	        return result
	      }
	    }
	    return result
	  }

	  // recursively evalutate the node of an AST
	  function walk(node){
	    if (!node) return
	    switch (node.type) {

	      case 'Program':
	        return walkAll(node.body)

	      case 'BlockStatement':
	        enterBlock()
	        var result = walkAll(node.body)
	        leaveBlock()
	        return result

	      case 'FunctionDeclaration':
	        var params = node.params.map(getName)
	        var value = getFunction(node.body, params, blockContext)
	        return context[node.id.name] = value

	      case 'FunctionExpression':
	        var params = node.params.map(getName)
	        return getFunction(node.body, params, blockContext)

	      case 'ReturnStatement':
	        var value = walk(node.argument)
	        return new ReturnValue('return', value)

	      case 'BreakStatement':
	        return new ReturnValue('break')

	      case 'ContinueStatement':
	        return new ReturnValue('continue')

	      case 'ExpressionStatement':
	        return walk(node.expression)

	      case 'AssignmentExpression':
	        return setValue(blockContext, node.left, node.right, node.operator)

	      case 'UpdateExpression':
	        return setValue(blockContext, node.argument, null, node.operator)

	      case 'VariableDeclaration':
	        node.declarations.forEach(function(declaration){
	          var target = node.kind === 'let' ? blockContext : context
	          if (declaration.init){
	            target[declaration.id.name] = walk(declaration.init)
	          } else {
	            target[declaration.id.name] = undefined
	          }
	        })
	        break

	      case 'SwitchStatement':
	        var defaultHandler = null
	        var matched = false
	        var value = walk(node.discriminant)
	        var result = undefined

	        enterBlock()

	        var i = 0
	        while (result == null){
	          if (i<node.cases.length){
	            if (node.cases[i].test){ // check or fall through
	              matched = matched || (walk(node.cases[i].test) === value)
	            } else if (defaultHandler == null) {
	              defaultHandler = i
	            }
	            if (matched){
	              var r = walkAll(node.cases[i].consequent)
	              if (r instanceof ReturnValue){ // break out
	                if (r.type == 'break') break
	                result = r
	              }
	            }
	            i += 1 // continue
	          } else if (!matched && defaultHandler != null){
	            // go back and do the default handler
	            i = defaultHandler
	            matched = true
	          } else {
	            // nothing we can do
	            break
	          }
	        }

	        leaveBlock()
	        return result

	      case 'IfStatement':
	        if (walk(node.test)){
	          return walk(node.consequent)
	        } else if (node.alternate) {
	          return walk(node.alternate)
	        }

	      case 'ForStatement':
	        var infinite = InfiniteChecker(maxIterations)
	        var result = undefined

	        enterBlock() // allow lets on delarations
	        for (walk(node.init); walk(node.test); walk(node.update)){
	          var r = walk(node.body)

	          // handle early return, continue and break
	          if (r instanceof ReturnValue){
	            if (r.type == 'continue') continue
	            if (r.type == 'break') break
	            result = r
	            break
	          }

	          infinite.check()
	        }
	        leaveBlock()
	        return result

	      case 'ForInStatement':
	        var infinite = InfiniteChecker(maxIterations)
	        var result = undefined

	        var value = walk(node.right)
	        var property = node.left

	        var target = context
	        enterBlock()

	        if (property.type == 'VariableDeclaration'){
	          walk(property)
	          property = property.declarations[0].id
	          if (property.kind === 'let'){
	            target = blockContext
	          }
	        }

	        for (var key in value){
	          setValue(target, property, {type: 'Literal', value: key})
	          var r = walk(node.body)

	          // handle early return, continue and break
	          if (r instanceof ReturnValue){
	            if (r.type == 'continue') continue
	            if (r.type == 'break') break
	            result = r
	            break
	          }

	          infinite.check()
	        }
	        leaveBlock()

	        return result

	      case 'WhileStatement':
	        var infinite = InfiniteChecker(maxIterations)
	        while (walk(node.test)){
	          walk(node.body)
	          infinite.check()
	        }
	        break

	      case 'TryStatement':
	        try {
	          walk(node.block)
	        } catch (error) {
	          enterBlock()
	          var catchClause = node.handlers[0]
	          if (catchClause) {
	            blockContext[catchClause.param.name] = error
	            walk(catchClause.body)
	          }
	          leaveBlock()
	        } finally {
	          if (node.finalizer) {
	            walk(node.finalizer)
	          }
	        }
	        break

	      case 'Literal':
	        return node.value

	      case 'UnaryExpression':
	        var val = walk(node.argument)
	        switch(node.operator) {
	          case '+': return +val
	          case '-': return -val
	          case '~': return ~val
	          case '!': return !val
	          case 'typeof': return typeof val
	          default: return unsupportedExpression(node)
	        }

	      case 'ArrayExpression':
	        var obj = blockContext['Array']()
	        for (var i=0;i<node.elements.length;i++){
	          obj.push(walk(node.elements[i]))
	        }
	        return obj

	      case 'ObjectExpression':
	        var obj = blockContext['Object']()
	        for (var i = 0; i < node.properties.length; i++) {
	          var prop = node.properties[i]
	          var value = (prop.value === null) ? prop.value : walk(prop.value)
	          obj[prop.key.value || prop.key.name] = value
	        }
	        return obj

	      case 'NewExpression':
	        var args = node.arguments.map(function(arg){
	          return walk(arg)
	        })
	        var target = walk(node.callee)
	        return primitives.applyNew(target, args)


	      case 'BinaryExpression':
	        var l = walk(node.left)
	        var r = walk(node.right)
	        switch(node.operator) {
	          case '==':  return l === r
	          case '===': return l === r
	          case '!=':  return l != r
	          case '!==': return l !== r
	          case '+':   return l + r
	          case '-':   return l - r
	          case '*':   return l * r
	          case '/':   return l / r
	          case '%':   return l % r
	          case '<':   return l < r
	          case '<=':  return l <= r
	          case '>':   return l > r
	          case '>=':  return l >= r
	          case '|':   return l | r
	          case '&':   return l & r
	          case '^':   return l ^ r
	          case 'instanceof': return l instanceof r
	          default: return unsupportedExpression(node)
	        }

	      case 'LogicalExpression':
	        switch(node.operator) {
	          case '&&':  return walk(node.left) && walk(node.right)
	          case '||':  return walk(node.left) || walk(node.right)
	          default: return unsupportedExpression(node)
	        }

	      case 'ThisExpression':
	        return blockContext['this']

	      case 'Identifier':
	        if (node.name === 'undefined'){
	          return undefined
	        } else if (hasProperty(blockContext, node.name, primitives)){
	          return finalValue(blockContext[node.name])
	        } else {
	          throw new ReferenceError(node.name + ' is not defined')
	        }

	      case 'CallExpression':
	        var args = node.arguments.map(function(arg){
	          return walk(arg)
	        })
	        var object = null
	        var target = walk(node.callee)

	        if (node.callee.type === 'MemberExpression'){
	          object = walk(node.callee.object)
	        }
	        return target.apply(object, args)

	      case 'MemberExpression':
	        var obj = walk(node.object)
	        if (node.computed){
	          var prop = walk(node.property)
	        } else {
	          var prop = node.property.name
	        }
	        obj = primitives.getPropertyObject(obj, prop)
	        return checkValue(obj[prop]);

	      case 'ConditionalExpression':
	        var val = walk(node.test)
	        return val ? walk(node.consequent) : walk(node.alternate)

	      case 'EmptyStatement':
	        return

	      default:
	        return unsupportedExpression(node)
	    }
	  }

	  // safely retrieve a value
	  function checkValue(value){
	    if (value === Function){
	      value = safeFunction
	    }
	    return finalValue(value)
	  }

	  // block scope context control
	  function enterBlock(){
	    blockContext = Object.create(blockContext)
	  }
	  function leaveBlock(){
	    blockContext = Object.getPrototypeOf(blockContext)
	  }

	  // set a value in the specified context if allowed
	  function setValue(object, left, right, operator){
	    var name = null

	    if (left.type === 'Identifier'){
	      name = left.name
	      // handle parent context shadowing
	      object = objectForKey(object, name, primitives)
	    } else if (left.type === 'MemberExpression'){
	      if (left.computed){
	        name = walk(left.property)
	      } else {
	        name = left.property.name
	      }
	      object = walk(left.object)
	    }

	    // stop built in properties from being able to be changed
	    if (canSetProperty(object, name, primitives)){
	      switch(operator) {
	        case undefined: return object[name] = walk(right)
	        case '=':  return object[name] = walk(right)
	        case '+=': return object[name] += walk(right)
	        case '-=': return object[name] -= walk(right)
	        case '++': return object[name]++
	        case '--': return object[name]--
	      }
	    }

	  }

	}

	// when an unsupported expression is encountered, throw an error
	function unsupportedExpression(node){
	  console.error(node)
	  var err = new Error('Unsupported expression: ' + node.type)
	  err.node = node
	  throw err
	}

	// walk a provided object's prototypal hierarchy to retrieve an inherited object
	function objectForKey(object, key, primitives){
	  var proto = primitives.getPrototypeOf(object)
	  if (!proto || hasOwnProperty(object, key)){
	    return object
	  } else {
	    return objectForKey(proto, key, primitives)
	  }
	}

	function hasProperty(object, key, primitives){
	  var proto = primitives.getPrototypeOf(object)
	  var hasOwn = hasOwnProperty(object, key)
	  if (object[key] !== undefined){
	    return true
	  } else if (!proto || hasOwn){
	    return hasOwn
	  } else {
	    return hasProperty(proto, key, primitives)
	  }
	}

	function hasOwnProperty(object, key){
	  return Object.prototype.hasOwnProperty.call(object, key)
	}

	function propertyIsEnumerable(object, key){
	  return Object.prototype.propertyIsEnumerable.call(object, key)
	}


	// determine if we have write access to a property
	function canSetProperty(object, property, primitives){
	  if (property === '__proto__' || primitives.isPrimitive(object)){
	    return false
	  } else if (object != null){

	    if (hasOwnProperty(object, property)){
	      if (propertyIsEnumerable(object, property)){
	        return true
	      } else {
	        return false
	      }
	    } else {
	      return canSetProperty(primitives.getPrototypeOf(object), property, primitives)
	    }

	  } else {
	    return true
	  }
	}

	// generate a function with specified context
	function getFunction(body, params, parentContext){
	  return function(){
	    var context = Object.create(parentContext)
	    if (this == global){
	      context['this'] = null
	    } else {
	      context['this'] = this
	    }
	    // normalize arguments array
	    var args = Array.prototype.slice.call(arguments)
	    context['arguments'] = arguments
	    args.forEach(function(arg,idx){
	      var param = params[idx]
	      if (param){
	        context[param] = arg
	      }
	    })
	    var result = evaluateAst(body, context)

	    if (result instanceof ReturnValue){
	      return result.value
	    }
	  }
	}

	function finalValue(value){
	  if (value instanceof ReturnValue){
	    return value.value
	  }
	  return value
	}

	// get the name of an identifier
	function getName(identifier){
	  return identifier.name
	}

	// a ReturnValue struct for differentiating between expression result and return statement
	function ReturnValue(type, value){
	  this.type = type
	  this.value = value
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
	  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
	  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
	  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
	  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.

	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	/*jslint bitwise:true plusplus:true */
	/*global esprima:true, define:true, exports:true, window: true,
	throwError: true, createLiteral: true, generateStatement: true,
	parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
	parseFunctionDeclaration: true, parseFunctionExpression: true,
	parseFunctionSourceElements: true, parseVariableIdentifier: true,
	parseLeftHandSideExpression: true,
	parseStatement: true, parseSourceElement: true */

	(function (root, factory) {
	    'use strict';

	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== 'undefined') {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';

	    var Token,
	        TokenName,
	        Syntax,
	        PropertyKind,
	        Messages,
	        Regex,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        length,
	        buffer,
	        state,
	        extra;

	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8
	    };

	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';

	    Syntax = {
	        AssignmentExpression: 'AssignmentExpression',
	        ArrayExpression: 'ArrayExpression',
	        BlockStatement: 'BlockStatement',
	        BinaryExpression: 'BinaryExpression',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DoWhileStatement: 'DoWhileStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExpressionStatement: 'ExpressionStatement',
	        ForStatement: 'ForStatement',
	        ForInStatement: 'ForInStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        NewExpression: 'NewExpression',
	        ObjectExpression: 'ObjectExpression',
	        Program: 'Program',
	        Property: 'Property',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SwitchStatement: 'SwitchStatement',
	        SwitchCase: 'SwitchCase',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TryStatement: 'TryStatement',
	        UnaryExpression: 'UnaryExpression',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement'
	    };

	    PropertyKind = {
	        Data: 1,
	        Get: 2,
	        Set: 4
	    };

	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken:  'Unexpected token %0',
	        UnexpectedNumber:  'Unexpected number',
	        UnexpectedString:  'Unexpected string',
	        UnexpectedIdentifier:  'Unexpected identifier',
	        UnexpectedReserved:  'Unexpected reserved word',
	        UnexpectedEOS:  'Unexpected end of input',
	        NewlineAfterThrow:  'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp:  'Invalid regular expression: missing /',
	        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
	        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally:  'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalReturn: 'Illegal return statement',
	        StrictModeWith:  'Strict mode code may not include a with statement',
	        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
	        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
	        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
	        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
	        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
	        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
	        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord:  'Use of future reserved word in strict mode'
	    };

	    // See also tools/generate-unicode-regex.py.
	    Regex = {
	        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
	        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
	    };

	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.

	    function assert(condition, message) {
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }

	    function sliceSource(from, to) {
	        return source.slice(from, to);
	    }

	    if (typeof 'esprima'[0] === 'undefined') {
	        sliceSource = function sliceArraySource(from, to) {
	            return source.slice(from, to).join('');
	        };
	    }

	    function isDecimalDigit(ch) {
	        return '0123456789'.indexOf(ch) >= 0;
	    }

	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }

	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }


	    // 7.2 White Space

	    function isWhiteSpace(ch) {
	        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
	            (ch === '\u000C') || (ch === '\u00A0') ||
	            (ch.charCodeAt(0) >= 0x1680 &&
	             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
	    }

	    // 7.3 Line Terminators

	    function isLineTerminator(ch) {
	        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
	    }

	    // 7.6 Identifier Names and Identifiers

	    function isIdentifierStart(ch) {
	        return (ch === '$') || (ch === '_') || (ch === '\\') ||
	            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
	            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
	    }

	    function isIdentifierPart(ch) {
	        return (ch === '$') || (ch === '_') || (ch === '\\') ||
	            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
	            ((ch >= '0') && (ch <= '9')) ||
	            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
	    }

	    // 7.6.1.2 Future Reserved Words

	    function isFutureReservedWord(id) {
	        switch (id) {

	        // Future reserved words.
	        case 'class':
	        case 'enum':
	        case 'export':
	        case 'extends':
	        case 'import':
	        case 'super':
	            return true;
	        }

	        return false;
	    }

	    function isStrictModeReservedWord(id) {
	        switch (id) {

	        // Strict Mode reserved words.
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        }

	        return false;
	    }

	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }

	    // 7.6.1.1 Keywords

	    function isKeyword(id) {
	        var keyword = false;
	        switch (id.length) {
	        case 2:
	            keyword = (id === 'if') || (id === 'in') || (id === 'do');
	            break;
	        case 3:
	            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
	            break;
	        case 4:
	            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
	            break;
	        case 5:
	            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
	            break;
	        case 6:
	            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch');
	            break;
	        case 7:
	            keyword = (id === 'default') || (id === 'finally');
	            break;
	        case 8:
	            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
	            break;
	        case 10:
	            keyword = (id === 'instanceof');
	            break;
	        }

	        if (keyword) {
	            return true;
	        }

	        switch (id) {
	        // Future reserved words.
	        // 'const' is specialized as Keyword in V8.
	        case 'const':
	            return true;

	        // For compatiblity to SpiderMonkey and ES.next
	        case 'yield':
	        case 'let':
	            return true;
	        }

	        if (strict && isStrictModeReservedWord(id)) {
	            return true;
	        }

	        return isFutureReservedWord(id);
	    }

	    // 7.4 Comments

	    function skipComment() {
	        var ch, blockComment, lineComment;

	        blockComment = false;
	        lineComment = false;

	        while (index < length) {
	            ch = source[index];

	            if (lineComment) {
	                ch = source[index++];
	                if (isLineTerminator(ch)) {
	                    lineComment = false;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    lineStart = index;
	                }
	            } else if (blockComment) {
	                if (isLineTerminator(ch)) {
	                    if (ch === '\r' && source[index + 1] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    ++index;
	                    lineStart = index;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    ch = source[index++];
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                    if (ch === '*') {
	                        ch = source[index];
	                        if (ch === '/') {
	                            ++index;
	                            blockComment = false;
	                        }
	                    }
	                }
	            } else if (ch === '/') {
	                ch = source[index + 1];
	                if (ch === '/') {
	                    index += 2;
	                    lineComment = true;
	                } else if (ch === '*') {
	                    index += 2;
	                    blockComment = true;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    break;
	                }
	            } else if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch ===  '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else {
	                break;
	            }
	        }
	    }

	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;

	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }

	    function scanIdentifier() {
	        var ch, start, id, restore;

	        ch = source[index];
	        if (!isIdentifierStart(ch)) {
	            return;
	        }

	        start = index;
	        if (ch === '\\') {
	            ++index;
	            if (source[index] !== 'u') {
	                return;
	            }
	            ++index;
	            restore = index;
	            ch = scanHexEscape('u');
	            if (ch) {
	                if (ch === '\\' || !isIdentifierStart(ch)) {
	                    return;
	                }
	                id = ch;
	            } else {
	                index = restore;
	                id = 'u';
	            }
	        } else {
	            id = source[index++];
	        }

	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	            if (ch === '\\') {
	                ++index;
	                if (source[index] !== 'u') {
	                    return;
	                }
	                ++index;
	                restore = index;
	                ch = scanHexEscape('u');
	                if (ch) {
	                    if (ch === '\\' || !isIdentifierPart(ch)) {
	                        return;
	                    }
	                    id += ch;
	                } else {
	                    index = restore;
	                    id += 'u';
	                }
	            } else {
	                id += source[index++];
	            }
	        }

	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            return {
	                type: Token.Identifier,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (isKeyword(id)) {
	            return {
	                type: Token.Keyword,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        // 7.8.1 Null Literals

	        if (id === 'null') {
	            return {
	                type: Token.NullLiteral,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        // 7.8.2 Boolean Literals

	        if (id === 'true' || id === 'false') {
	            return {
	                type: Token.BooleanLiteral,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        return {
	            type: Token.Identifier,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    // 7.7 Punctuators

	    function scanPunctuator() {
	        var start = index,
	            ch1 = source[index],
	            ch2,
	            ch3,
	            ch4;

	        // Check for most common single-character punctuators.

	        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        // Dot (.) can also start a floating-point number, hence the need
	        // to check the next character.

	        ch2 = source[index + 1];
	        if (ch1 === '.' && !isDecimalDigit(ch2)) {
	            return {
	                type: Token.Punctuator,
	                value: source[index++],
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        // Peek more characters.

	        ch3 = source[index + 2];
	        ch4 = source[index + 3];

	        // 4-character punctuator: >>>=

	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            if (ch4 === '=') {
	                index += 4;
	                return {
	                    type: Token.Punctuator,
	                    value: '>>>=',
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }

	        // 3-character punctuators: === !== >>> <<= >>=

	        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '===',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '!==',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>>',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '<<=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        // 2-character punctuators: <= >= == != ++ -- << >> && ||
	        // += -= *= %= &= |= ^= /=

	        if (ch2 === '=') {
	            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	                index += 2;
	                return {
	                    type: Token.Punctuator,
	                    value: ch1 + ch2,
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }

	        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
	            if ('+-<>&|'.indexOf(ch2) >= 0) {
	                index += 2;
	                return {
	                    type: Token.Punctuator,
	                    value: ch1 + ch2,
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }

	        // The remaining 1-character punctuators.

	        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
	            return {
	                type: Token.Punctuator,
	                value: source[index++],
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	    }

	    // 7.8.3 Numeric Literals

	    function scanNumericLiteral() {
	        var number, start, ch;

	        ch = source[index];
	        assert(isDecimalDigit(ch) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');

	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];

	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    number += source[index++];
	                    while (index < length) {
	                        ch = source[index];
	                        if (!isHexDigit(ch)) {
	                            break;
	                        }
	                        number += source[index++];
	                    }

	                    if (number.length <= 2) {
	                        // only 0x
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }

	                    if (index < length) {
	                        ch = source[index];
	                        if (isIdentifierStart(ch)) {
	                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                        }
	                    }
	                    return {
	                        type: Token.NumericLiteral,
	                        value: parseInt(number, 16),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                } else if (isOctalDigit(ch)) {
	                    number += source[index++];
	                    while (index < length) {
	                        ch = source[index];
	                        if (!isOctalDigit(ch)) {
	                            break;
	                        }
	                        number += source[index++];
	                    }

	                    if (index < length) {
	                        ch = source[index];
	                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                        }
	                    }
	                    return {
	                        type: Token.NumericLiteral,
	                        value: parseInt(number, 8),
	                        octal: true,
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                }

	                // decimal number starts with '0' such as '09' is illegal.
	                if (isDecimalDigit(ch)) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            }

	            while (index < length) {
	                ch = source[index];
	                if (!isDecimalDigit(ch)) {
	                    break;
	                }
	                number += source[index++];
	            }
	        }

	        if (ch === '.') {
	            number += source[index++];
	            while (index < length) {
	                ch = source[index];
	                if (!isDecimalDigit(ch)) {
	                    break;
	                }
	                number += source[index++];
	            }
	        }

	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];

	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }

	            ch = source[index];
	            if (isDecimalDigit(ch)) {
	                number += source[index++];
	                while (index < length) {
	                    ch = source[index];
	                    if (!isDecimalDigit(ch)) {
	                        break;
	                    }
	                    number += source[index++];
	                }
	            } else {
	                ch = 'character ' + ch;
	                if (index >= length) {
	                    ch = '<end>';
	                }
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }

	        if (index < length) {
	            ch = source[index];
	            if (isIdentifierStart(ch)) {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    // 7.8.4 String Literals

	    function scanStringLiteral() {
	        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');

	        start = index;
	        ++index;

	        while (index < length) {
	            ch = source[index++];

	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!isLineTerminator(ch)) {
	                    switch (ch) {
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        restore = index;
	                        unescaped = scanHexEscape(ch);
	                        if (unescaped) {
	                            str += unescaped;
	                        } else {
	                            index = restore;
	                            str += ch;
	                        }
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;

	                    default:
	                        if (isOctalDigit(ch)) {
	                            code = '01234567'.indexOf(ch);

	                            // \0 is not octal escape sequence
	                            if (code !== 0) {
	                                octal = true;
	                            }

	                            if (index < length && isOctalDigit(source[index])) {
	                                octal = true;
	                                code = code * 8 + '01234567'.indexOf(source[index++]);

	                                // 3 digits are only allowed when string starts
	                                // with 0, 1, 2, 3
	                                if ('0123'.indexOf(ch) >= 0 &&
	                                        index < length &&
	                                        isOctalDigit(source[index])) {
	                                    code = code * 8 + '01234567'.indexOf(source[index++]);
	                                }
	                            }
	                            str += String.fromCharCode(code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch ===  '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                }
	            } else if (isLineTerminator(ch)) {
	                break;
	            } else {
	                str += ch;
	            }
	        }

	        if (quote !== '') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanRegExp() {
	        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

	        buffer = null;
	        skipComment();

	        start = index;
	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];

	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch)) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                } else if (isLineTerminator(ch)) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	            }
	        }

	        if (!terminated) {
	            throwError({}, Messages.UnterminatedRegExp);
	        }

	        // Exclude leading and trailing slash.
	        pattern = str.substr(1, str.length - 2);

	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch)) {
	                break;
	            }

	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        str += '\\u';
	                        for (; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                } else {
	                    str += '\\';
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }

	        try {
	            value = new RegExp(pattern, flags);
	        } catch (e) {
	            throwError({}, Messages.InvalidRegExp);
	        }

	        return {
	            literal: str,
	            value: value,
	            range: [start, index]
	        };
	    }

	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }

	    function advance() {
	        var ch, token;

	        skipComment();

	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [index, index]
	            };
	        }

	        token = scanPunctuator();
	        if (typeof token !== 'undefined') {
	            return token;
	        }

	        ch = source[index];

	        if (ch === '\'' || ch === '"') {
	            return scanStringLiteral();
	        }

	        if (ch === '.' || isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }

	        token = scanIdentifier();
	        if (typeof token !== 'undefined') {
	            return token;
	        }

	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }

	    function lex() {
	        var token;

	        if (buffer) {
	            index = buffer.range[1];
	            lineNumber = buffer.lineNumber;
	            lineStart = buffer.lineStart;
	            token = buffer;
	            buffer = null;
	            return token;
	        }

	        buffer = null;
	        return advance();
	    }

	    function lookahead() {
	        var pos, line, start;

	        if (buffer !== null) {
	            return buffer;
	        }

	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        buffer = advance();
	        index = pos;
	        lineNumber = line;
	        lineStart = start;

	        return buffer;
	    }

	    // Return true if there is a line terminator before the next token.

	    function peekLineTerminator() {
	        var pos, line, start, found;

	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        skipComment();
	        found = lineNumber !== line;
	        index = pos;
	        lineNumber = line;
	        lineStart = start;

	        return found;
	    }

	    // Throw an exception

	    function throwError(token, messageFormat) {
	        var error,
	            args = Array.prototype.slice.call(arguments, 2),
	            msg = messageFormat.replace(
	                /%(\d)/g,
	                function (whole, index) {
	                    return args[index] || '';
	                }
	            );

	        if (typeof token.lineNumber === 'number') {
	            error = new Error('Line ' + token.lineNumber + ': ' + msg);
	            error.index = token.range[0];
	            error.lineNumber = token.lineNumber;
	            error.column = token.range[0] - lineStart + 1;
	        } else {
	            error = new Error('Line ' + lineNumber + ': ' + msg);
	            error.index = index;
	            error.lineNumber = lineNumber;
	            error.column = index - lineStart + 1;
	        }

	        throw error;
	    }

	    function throwErrorTolerant() {
	        try {
	            throwError.apply(null, arguments);
	        } catch (e) {
	            if (extra.errors) {
	                extra.errors.push(e);
	            } else {
	                throw e;
	            }
	        }
	    }


	    // Throw an exception because of the token.

	    function throwUnexpected(token) {
	        if (token.type === Token.EOF) {
	            throwError(token, Messages.UnexpectedEOS);
	        }

	        if (token.type === Token.NumericLiteral) {
	            throwError(token, Messages.UnexpectedNumber);
	        }

	        if (token.type === Token.StringLiteral) {
	            throwError(token, Messages.UnexpectedString);
	        }

	        if (token.type === Token.Identifier) {
	            throwError(token, Messages.UnexpectedIdentifier);
	        }

	        if (token.type === Token.Keyword) {
	            if (isFutureReservedWord(token.value)) {
	                throwError(token, Messages.UnexpectedReserved);
	            } else if (strict && isStrictModeReservedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictReservedWord);
	                return;
	            }
	            throwError(token, Messages.UnexpectedToken, token.value);
	        }

	        // BooleanLiteral, NullLiteral, or Punctuator.
	        throwError(token, Messages.UnexpectedToken, token.value);
	    }

	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.

	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpected(token);
	        }
	    }

	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.

	    function expectKeyword(keyword) {
	        var token = lex();
	        if (token.type !== Token.Keyword || token.value !== keyword) {
	            throwUnexpected(token);
	        }
	    }

	    // Return true if the next token matches the specified punctuator.

	    function match(value) {
	        var token = lookahead();
	        return token.type === Token.Punctuator && token.value === value;
	    }

	    // Return true if the next token matches the specified keyword

	    function matchKeyword(keyword) {
	        var token = lookahead();
	        return token.type === Token.Keyword && token.value === keyword;
	    }

	    // Return true if the next token is an assignment operator

	    function matchAssign() {
	        var token = lookahead(),
	            op = token.value;

	        if (token.type !== Token.Punctuator) {
	            return false;
	        }
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }

	    function consumeSemicolon() {
	        var token, line;

	        // Catch the very common case first.
	        if (source[index] === ';') {
	            lex();
	            return;
	        }

	        line = lineNumber;
	        skipComment();
	        if (lineNumber !== line) {
	            return;
	        }

	        if (match(';')) {
	            lex();
	            return;
	        }

	        token = lookahead();
	        if (token.type !== Token.EOF && !match('}')) {
	            throwUnexpected(token);
	        }
	    }

	    // Return true if provided expression is LeftHandSideExpression

	    function isLeftHandSide(expr) {
	        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
	    }

	    // 11.1.4 Array Initialiser

	    function parseArrayInitialiser() {
	        var elements = [];

	        expect('[');

	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                elements.push(parseAssignmentExpression());

	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }

	        expect(']');

	        return {
	            type: Syntax.ArrayExpression,
	            elements: elements
	        };
	    }

	    // 11.1.5 Object Initialiser

	    function parsePropertyFunction(param, first) {
	        var previousStrict, body;

	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (first && strict && isRestrictedWord(param[0].name)) {
	            throwErrorTolerant(first, Messages.StrictParamName);
	        }
	        strict = previousStrict;

	        return {
	            type: Syntax.FunctionExpression,
	            id: null,
	            params: param,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }

	    function parseObjectPropertyKey() {
	        var token = lex();

	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.

	        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return createLiteral(token);
	        }

	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }

	    function parseObjectProperty() {
	        var token, key, id, param;

	        token = lookahead();

	        if (token.type === Token.Identifier) {

	            id = parseObjectPropertyKey();

	            // Property Assignment: Getter and Setter.

	            if (token.value === 'get' && !match(':')) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                expect(')');
	                return {
	                    type: Syntax.Property,
	                    key: key,
	                    value: parsePropertyFunction([]),
	                    kind: 'get'
	                };
	            } else if (token.value === 'set' && !match(':')) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                token = lookahead();
	                if (token.type !== Token.Identifier) {
	                    expect(')');
	                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
	                    return {
	                        type: Syntax.Property,
	                        key: key,
	                        value: parsePropertyFunction([]),
	                        kind: 'set'
	                    };
	                } else {
	                    param = [ parseVariableIdentifier() ];
	                    expect(')');
	                    return {
	                        type: Syntax.Property,
	                        key: key,
	                        value: parsePropertyFunction(param, token),
	                        kind: 'set'
	                    };
	                }
	            } else {
	                expect(':');
	                return {
	                    type: Syntax.Property,
	                    key: id,
	                    value: parseAssignmentExpression(),
	                    kind: 'init'
	                };
	            }
	        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
	            throwUnexpected(token);
	        } else {
	            key = parseObjectPropertyKey();
	            expect(':');
	            return {
	                type: Syntax.Property,
	                key: key,
	                value: parseAssignmentExpression(),
	                kind: 'init'
	            };
	        }
	    }

	    function parseObjectInitialiser() {
	        var properties = [], property, name, kind, map = {}, toString = String;

	        expect('{');

	        while (!match('}')) {
	            property = parseObjectProperty();

	            if (property.key.type === Syntax.Identifier) {
	                name = property.key.name;
	            } else {
	                name = toString(property.key.value);
	            }
	            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
	            if (Object.prototype.hasOwnProperty.call(map, name)) {
	                if (map[name] === PropertyKind.Data) {
	                    if (strict && kind === PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
	                    } else if (kind !== PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.AccessorDataProperty);
	                    }
	                } else {
	                    if (kind === PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.AccessorDataProperty);
	                    } else if (map[name] & kind) {
	                        throwErrorTolerant({}, Messages.AccessorGetSet);
	                    }
	                }
	                map[name] |= kind;
	            } else {
	                map[name] = kind;
	            }

	            properties.push(property);

	            if (!match('}')) {
	                expect(',');
	            }
	        }

	        expect('}');

	        return {
	            type: Syntax.ObjectExpression,
	            properties: properties
	        };
	    }

	    // 11.1.6 The Grouping Operator

	    function parseGroupExpression() {
	        var expr;

	        expect('(');

	        expr = parseExpression();

	        expect(')');

	        return expr;
	    }


	    // 11.1 Primary Expressions

	    function parsePrimaryExpression() {
	        var token = lookahead(),
	            type = token.type;

	        if (type === Token.Identifier) {
	            return {
	                type: Syntax.Identifier,
	                name: lex().value
	            };
	        }

	        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return createLiteral(lex());
	        }

	        if (type === Token.Keyword) {
	            if (matchKeyword('this')) {
	                lex();
	                return {
	                    type: Syntax.ThisExpression
	                };
	            }

	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }
	        }

	        if (type === Token.BooleanLiteral) {
	            lex();
	            token.value = (token.value === 'true');
	            return createLiteral(token);
	        }

	        if (type === Token.NullLiteral) {
	            lex();
	            token.value = null;
	            return createLiteral(token);
	        }

	        if (match('[')) {
	            return parseArrayInitialiser();
	        }

	        if (match('{')) {
	            return parseObjectInitialiser();
	        }

	        if (match('(')) {
	            return parseGroupExpression();
	        }

	        if (match('/') || match('/=')) {
	            return createLiteral(scanRegExp());
	        }

	        return throwUnexpected(lex());
	    }

	    // 11.2 Left-Hand-Side Expressions

	    function parseArguments() {
	        var args = [];

	        expect('(');

	        if (!match(')')) {
	            while (index < length) {
	                args.push(parseAssignmentExpression());
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        expect(')');

	        return args;
	    }

	    function parseNonComputedProperty() {
	        var token = lex();

	        if (!isIdentifierName(token)) {
	            throwUnexpected(token);
	        }

	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }

	    function parseNonComputedMember() {
	        expect('.');

	        return parseNonComputedProperty();
	    }

	    function parseComputedMember() {
	        var expr;

	        expect('[');

	        expr = parseExpression();

	        expect(']');

	        return expr;
	    }

	    function parseNewExpression() {
	        var expr;

	        expectKeyword('new');

	        expr = {
	            type: Syntax.NewExpression,
	            callee: parseLeftHandSideExpression(),
	            'arguments': []
	        };

	        if (match('(')) {
	            expr['arguments'] = parseArguments();
	        }

	        return expr;
	    }

	    function parseLeftHandSideExpressionAllowCall() {
	        var expr;

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        while (match('.') || match('[') || match('(')) {
	            if (match('(')) {
	                expr = {
	                    type: Syntax.CallExpression,
	                    callee: expr,
	                    'arguments': parseArguments()
	                };
	            } else if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	            }
	        }

	        return expr;
	    }


	    function parseLeftHandSideExpression() {
	        var expr;

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        while (match('.') || match('[')) {
	            if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	            }
	        }

	        return expr;
	    }

	    // 11.3 Postfix Expressions

	    function parsePostfixExpression() {
	        var expr = parseLeftHandSideExpressionAllowCall(), token;

	        token = lookahead();
	        if (token.type !== Token.Punctuator) {
	            return expr;
	        }

	        if ((match('++') || match('--')) && !peekLineTerminator()) {
	            // 11.3.1, 11.3.2
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPostfix);
	            }
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }

	            expr = {
	                type: Syntax.UpdateExpression,
	                operator: lex().value,
	                argument: expr,
	                prefix: false
	            };
	        }

	        return expr;
	    }

	    // 11.4 Unary Operators

	    function parseUnaryExpression() {
	        var token, expr;

	        token = lookahead();
	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return parsePostfixExpression();
	        }

	        if (match('++') || match('--')) {
	            token = lex();
	            expr = parseUnaryExpression();
	            // 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPrefix);
	            }

	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }

	            expr = {
	                type: Syntax.UpdateExpression,
	                operator: token.value,
	                argument: expr,
	                prefix: true
	            };
	            return expr;
	        }

	        if (match('+') || match('-') || match('~') || match('!')) {
	            expr = {
	                type: Syntax.UnaryExpression,
	                operator: lex().value,
	                argument: parseUnaryExpression(),
	                prefix: true
	            };
	            return expr;
	        }

	        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            expr = {
	                type: Syntax.UnaryExpression,
	                operator: lex().value,
	                argument: parseUnaryExpression(),
	                prefix: true
	            };
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                throwErrorTolerant({}, Messages.StrictDelete);
	            }
	            return expr;
	        }

	        return parsePostfixExpression();
	    }

	    // 11.5 Multiplicative Operators

	    function parseMultiplicativeExpression() {
	        var expr = parseUnaryExpression();

	        while (match('*') || match('/') || match('%')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseUnaryExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.6 Additive Operators

	    function parseAdditiveExpression() {
	        var expr = parseMultiplicativeExpression();

	        while (match('+') || match('-')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseMultiplicativeExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.7 Bitwise Shift Operators

	    function parseShiftExpression() {
	        var expr = parseAdditiveExpression();

	        while (match('<<') || match('>>') || match('>>>')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseAdditiveExpression()
	            };
	        }

	        return expr;
	    }
	    // 11.8 Relational Operators

	    function parseRelationalExpression() {
	        var expr, previousAllowIn;

	        previousAllowIn = state.allowIn;
	        state.allowIn = true;

	        expr = parseShiftExpression();

	        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseShiftExpression()
	            };
	        }

	        state.allowIn = previousAllowIn;
	        return expr;
	    }

	    // 11.9 Equality Operators

	    function parseEqualityExpression() {
	        var expr = parseRelationalExpression();

	        while (match('==') || match('!=') || match('===') || match('!==')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseRelationalExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.10 Binary Bitwise Operators

	    function parseBitwiseANDExpression() {
	        var expr = parseEqualityExpression();

	        while (match('&')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '&',
	                left: expr,
	                right: parseEqualityExpression()
	            };
	        }

	        return expr;
	    }

	    function parseBitwiseXORExpression() {
	        var expr = parseBitwiseANDExpression();

	        while (match('^')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '^',
	                left: expr,
	                right: parseBitwiseANDExpression()
	            };
	        }

	        return expr;
	    }

	    function parseBitwiseORExpression() {
	        var expr = parseBitwiseXORExpression();

	        while (match('|')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '|',
	                left: expr,
	                right: parseBitwiseXORExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.11 Binary Logical Operators

	    function parseLogicalANDExpression() {
	        var expr = parseBitwiseORExpression();

	        while (match('&&')) {
	            lex();
	            expr = {
	                type: Syntax.LogicalExpression,
	                operator: '&&',
	                left: expr,
	                right: parseBitwiseORExpression()
	            };
	        }

	        return expr;
	    }

	    function parseLogicalORExpression() {
	        var expr = parseLogicalANDExpression();

	        while (match('||')) {
	            lex();
	            expr = {
	                type: Syntax.LogicalExpression,
	                operator: '||',
	                left: expr,
	                right: parseLogicalANDExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.12 Conditional Operator

	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent;

	        expr = parseLogicalORExpression();

	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = parseAssignmentExpression();
	            state.allowIn = previousAllowIn;
	            expect(':');

	            expr = {
	                type: Syntax.ConditionalExpression,
	                test: expr,
	                consequent: consequent,
	                alternate: parseAssignmentExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.13 Assignment Operators

	    function parseAssignmentExpression() {
	        var token, expr;

	        token = lookahead();
	        expr = parseConditionalExpression();

	        if (matchAssign()) {
	            // LeftHandSideExpression
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }

	            // 11.13.1
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant(token, Messages.StrictLHSAssignment);
	            }

	            expr = {
	                type: Syntax.AssignmentExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseAssignmentExpression()
	            };
	        }

	        return expr;
	    }

	    // 11.14 Comma Operator

	    function parseExpression() {
	        var expr = parseAssignmentExpression();

	        if (match(',')) {
	            expr = {
	                type: Syntax.SequenceExpression,
	                expressions: [ expr ]
	            };

	            while (index < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	                expr.expressions.push(parseAssignmentExpression());
	            }

	        }
	        return expr;
	    }

	    // 12.1 Block

	    function parseStatementList() {
	        var list = [],
	            statement;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            statement = parseSourceElement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            list.push(statement);
	        }

	        return list;
	    }

	    function parseBlock() {
	        var block;

	        expect('{');

	        block = parseStatementList();

	        expect('}');

	        return {
	            type: Syntax.BlockStatement,
	            body: block
	        };
	    }

	    // 12.2 Variable Statement

	    function parseVariableIdentifier() {
	        var token = lex();

	        if (token.type !== Token.Identifier) {
	            throwUnexpected(token);
	        }

	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }

	    function parseVariableDeclaration(kind) {
	        var id = parseVariableIdentifier(),
	            init = null;

	        // 12.2.1
	        if (strict && isRestrictedWord(id.name)) {
	            throwErrorTolerant({}, Messages.StrictVarName);
	        }

	        if (kind === 'const') {
	            expect('=');
	            init = parseAssignmentExpression();
	        } else if (match('=')) {
	            lex();
	            init = parseAssignmentExpression();
	        }

	        return {
	            type: Syntax.VariableDeclarator,
	            id: id,
	            init: init
	        };
	    }

	    function parseVariableDeclarationList(kind) {
	        var list = [];

	        do {
	            list.push(parseVariableDeclaration(kind));
	            if (!match(',')) {
	                break;
	            }
	            lex();
	        } while (index < length);

	        return list;
	    }

	    function parseVariableStatement() {
	        var declarations;

	        expectKeyword('var');

	        declarations = parseVariableDeclarationList();

	        consumeSemicolon();

	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: declarations,
	            kind: 'var'
	        };
	    }

	    // kind may be `const` or `let`
	    // Both are experimental and not in the specification yet.
	    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
	    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
	    function parseConstLetDeclaration(kind) {
	        var declarations;

	        expectKeyword(kind);

	        declarations = parseVariableDeclarationList(kind);

	        consumeSemicolon();

	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: declarations,
	            kind: kind
	        };
	    }

	    // 12.3 Empty Statement

	    function parseEmptyStatement() {
	        expect(';');

	        return {
	            type: Syntax.EmptyStatement
	        };
	    }

	    // 12.4 Expression Statement

	    function parseExpressionStatement() {
	        var expr = parseExpression();

	        consumeSemicolon();

	        return {
	            type: Syntax.ExpressionStatement,
	            expression: expr
	        };
	    }

	    // 12.5 If statement

	    function parseIfStatement() {
	        var test, consequent, alternate;

	        expectKeyword('if');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        consequent = parseStatement();

	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }

	        return {
	            type: Syntax.IfStatement,
	            test: test,
	            consequent: consequent,
	            alternate: alternate
	        };
	    }

	    // 12.6 Iteration Statements

	    function parseDoWhileStatement() {
	        var body, test, oldInIteration;

	        expectKeyword('do');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        expectKeyword('while');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        if (match(';')) {
	            lex();
	        }

	        return {
	            type: Syntax.DoWhileStatement,
	            body: body,
	            test: test
	        };
	    }

	    function parseWhileStatement() {
	        var test, body, oldInIteration;

	        expectKeyword('while');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        return {
	            type: Syntax.WhileStatement,
	            test: test,
	            body: body
	        };
	    }

	    function parseForVariableDeclaration() {
	        var token = lex();

	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: parseVariableDeclarationList(),
	            kind: token.value
	        };
	    }

	    function parseForStatement() {
	        var init, test, update, left, right, body, oldInIteration;

	        init = test = update = null;

	        expectKeyword('for');

	        expect('(');

	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var') || matchKeyword('let')) {
	                state.allowIn = false;
	                init = parseForVariableDeclaration();
	                state.allowIn = true;

	                if (init.declarations.length === 1 && matchKeyword('in')) {
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            } else {
	                state.allowIn = false;
	                init = parseExpression();
	                state.allowIn = true;

	                if (matchKeyword('in')) {
	                    // LeftHandSideExpression
	                    if (!isLeftHandSide(init)) {
	                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
	                    }

	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            }

	            if (typeof left === 'undefined') {
	                expect(';');
	            }
	        }

	        if (typeof left === 'undefined') {

	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');

	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }

	        expect(')');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        if (typeof left === 'undefined') {
	            return {
	                type: Syntax.ForStatement,
	                init: init,
	                test: test,
	                update: update,
	                body: body
	            };
	        }

	        return {
	            type: Syntax.ForInStatement,
	            left: left,
	            right: right,
	            body: body,
	            each: false
	        };
	    }

	    // 12.7 The continue statement

	    function parseContinueStatement() {
	        var token, label = null;

	        expectKeyword('continue');

	        // Optimize the most common form: 'continue;'.
	        if (source[index] === ';') {
	            lex();

	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }

	            return {
	                type: Syntax.ContinueStatement,
	                label: null
	            };
	        }

	        if (peekLineTerminator()) {
	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }

	            return {
	                type: Syntax.ContinueStatement,
	                label: null
	            };
	        }

	        token = lookahead();
	        if (token.type === Token.Identifier) {
	            label = parseVariableIdentifier();

	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }

	        consumeSemicolon();

	        if (label === null && !state.inIteration) {
	            throwError({}, Messages.IllegalContinue);
	        }

	        return {
	            type: Syntax.ContinueStatement,
	            label: label
	        };
	    }

	    // 12.8 The break statement

	    function parseBreakStatement() {
	        var token, label = null;

	        expectKeyword('break');

	        // Optimize the most common form: 'break;'.
	        if (source[index] === ';') {
	            lex();

	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }

	            return {
	                type: Syntax.BreakStatement,
	                label: null
	            };
	        }

	        if (peekLineTerminator()) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }

	            return {
	                type: Syntax.BreakStatement,
	                label: null
	            };
	        }

	        token = lookahead();
	        if (token.type === Token.Identifier) {
	            label = parseVariableIdentifier();

	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }

	        consumeSemicolon();

	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError({}, Messages.IllegalBreak);
	        }

	        return {
	            type: Syntax.BreakStatement,
	            label: label
	        };
	    }

	    // 12.9 The return statement

	    function parseReturnStatement() {
	        var token, argument = null;

	        expectKeyword('return');

	        if (!state.inFunctionBody) {
	            throwErrorTolerant({}, Messages.IllegalReturn);
	        }

	        // 'return' followed by a space and an identifier is very common.
	        if (source[index] === ' ') {
	            if (isIdentifierStart(source[index + 1])) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return {
	                    type: Syntax.ReturnStatement,
	                    argument: argument
	                };
	            }
	        }

	        if (peekLineTerminator()) {
	            return {
	                type: Syntax.ReturnStatement,
	                argument: null
	            };
	        }

	        if (!match(';')) {
	            token = lookahead();
	            if (!match('}') && token.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }

	        consumeSemicolon();

	        return {
	            type: Syntax.ReturnStatement,
	            argument: argument
	        };
	    }

	    // 12.10 The with statement

	    function parseWithStatement() {
	        var object, body;

	        if (strict) {
	            throwErrorTolerant({}, Messages.StrictModeWith);
	        }

	        expectKeyword('with');

	        expect('(');

	        object = parseExpression();

	        expect(')');

	        body = parseStatement();

	        return {
	            type: Syntax.WithStatement,
	            object: object,
	            body: body
	        };
	    }

	    // 12.10 The swith statement

	    function parseSwitchCase() {
	        var test,
	            consequent = [],
	            statement;

	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');

	        while (index < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            statement = parseStatement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            consequent.push(statement);
	        }

	        return {
	            type: Syntax.SwitchCase,
	            test: test,
	            consequent: consequent
	        };
	    }

	    function parseSwitchStatement() {
	        var discriminant, cases, clause, oldInSwitch, defaultFound;

	        expectKeyword('switch');

	        expect('(');

	        discriminant = parseExpression();

	        expect(')');

	        expect('{');

	        cases = [];

	        if (match('}')) {
	            lex();
	            return {
	                type: Syntax.SwitchStatement,
	                discriminant: discriminant,
	                cases: cases
	            };
	        }

	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError({}, Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }

	        state.inSwitch = oldInSwitch;

	        expect('}');

	        return {
	            type: Syntax.SwitchStatement,
	            discriminant: discriminant,
	            cases: cases
	        };
	    }

	    // 12.13 The throw statement

	    function parseThrowStatement() {
	        var argument;

	        expectKeyword('throw');

	        if (peekLineTerminator()) {
	            throwError({}, Messages.NewlineAfterThrow);
	        }

	        argument = parseExpression();

	        consumeSemicolon();

	        return {
	            type: Syntax.ThrowStatement,
	            argument: argument
	        };
	    }

	    // 12.14 The try statement

	    function parseCatchClause() {
	        var param;

	        expectKeyword('catch');

	        expect('(');
	        if (match(')')) {
	            throwUnexpected(lookahead());
	        }

	        param = parseVariableIdentifier();
	        // 12.14.1
	        if (strict && isRestrictedWord(param.name)) {
	            throwErrorTolerant({}, Messages.StrictCatchVariable);
	        }

	        expect(')');

	        return {
	            type: Syntax.CatchClause,
	            param: param,
	            body: parseBlock()
	        };
	    }

	    function parseTryStatement() {
	        var block, handlers = [], finalizer = null;

	        expectKeyword('try');

	        block = parseBlock();

	        if (matchKeyword('catch')) {
	            handlers.push(parseCatchClause());
	        }

	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }

	        if (handlers.length === 0 && !finalizer) {
	            throwError({}, Messages.NoCatchOrFinally);
	        }

	        return {
	            type: Syntax.TryStatement,
	            block: block,
	            guardedHandlers: [],
	            handlers: handlers,
	            finalizer: finalizer
	        };
	    }

	    // 12.15 The debugger statement

	    function parseDebuggerStatement() {
	        expectKeyword('debugger');

	        consumeSemicolon();

	        return {
	            type: Syntax.DebuggerStatement
	        };
	    }

	    // 12 Statements

	    function parseStatement() {
	        var token = lookahead(),
	            expr,
	            labeledBody;

	        if (token.type === Token.EOF) {
	            throwUnexpected(token);
	        }

	        if (token.type === Token.Punctuator) {
	            switch (token.value) {
	            case ';':
	                return parseEmptyStatement();
	            case '{':
	                return parseBlock();
	            case '(':
	                return parseExpressionStatement();
	            default:
	                break;
	            }
	        }

	        if (token.type === Token.Keyword) {
	            switch (token.value) {
	            case 'break':
	                return parseBreakStatement();
	            case 'continue':
	                return parseContinueStatement();
	            case 'debugger':
	                return parseDebuggerStatement();
	            case 'do':
	                return parseDoWhileStatement();
	            case 'for':
	                return parseForStatement();
	            case 'function':
	                return parseFunctionDeclaration();
	            case 'if':
	                return parseIfStatement();
	            case 'return':
	                return parseReturnStatement();
	            case 'switch':
	                return parseSwitchStatement();
	            case 'throw':
	                return parseThrowStatement();
	            case 'try':
	                return parseTryStatement();
	            case 'var':
	                return parseVariableStatement();
	            case 'while':
	                return parseWhileStatement();
	            case 'with':
	                return parseWithStatement();
	            default:
	                break;
	            }
	        }

	        expr = parseExpression();

	        // 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();

	            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
	                throwError({}, Messages.Redeclaration, 'Label', expr.name);
	            }

	            state.labelSet[expr.name] = true;
	            labeledBody = parseStatement();
	            delete state.labelSet[expr.name];

	            return {
	                type: Syntax.LabeledStatement,
	                label: expr,
	                body: labeledBody
	            };
	        }

	        consumeSemicolon();

	        return {
	            type: Syntax.ExpressionStatement,
	            expression: expr
	        };
	    }

	    // 13 Function Definition

	    function parseFunctionSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

	        expect('{');

	        while (index < length) {
	            token = lookahead();
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }

	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }

	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;

	        state.labelSet = {};
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }

	        expect('}');

	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;

	        return {
	            type: Syntax.BlockStatement,
	            body: sourceElements
	        };
	    }

	    function parseFunctionDeclaration() {
	        var id, param, params = [], body, token, stricted, firstRestricted, message, previousStrict, paramSet;

	        expectKeyword('function');
	        token = lookahead();
	        id = parseVariableIdentifier();
	        if (strict) {
	            if (isRestrictedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictFunctionName);
	            }
	        } else {
	            if (isRestrictedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictFunctionName;
	            } else if (isStrictModeReservedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictReservedWord;
	            }
	        }

	        expect('(');

	        if (!match(')')) {
	            paramSet = {};
	            while (index < length) {
	                token = lookahead();
	                param = parseVariableIdentifier();
	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamName;
	                    }
	                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                } else if (!firstRestricted) {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                }
	                params.push(param);
	                paramSet[param.name] = true;
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        expect(')');

	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            throwErrorTolerant(stricted, message);
	        }
	        strict = previousStrict;

	        return {
	            type: Syntax.FunctionDeclaration,
	            id: id,
	            params: params,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }

	    function parseFunctionExpression() {
	        var token, id = null, stricted, firstRestricted, message, param, params = [], body, previousStrict, paramSet;

	        expectKeyword('function');

	        if (!match('(')) {
	            token = lookahead();
	            id = parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    throwErrorTolerant(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }

	        expect('(');

	        if (!match(')')) {
	            paramSet = {};
	            while (index < length) {
	                token = lookahead();
	                param = parseVariableIdentifier();
	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamName;
	                    }
	                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                } else if (!firstRestricted) {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                }
	                params.push(param);
	                paramSet[param.name] = true;
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        expect(')');

	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            throwErrorTolerant(stricted, message);
	        }
	        strict = previousStrict;

	        return {
	            type: Syntax.FunctionExpression,
	            id: id,
	            params: params,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }

	    // 14 Program

	    function parseSourceElement() {
	        var token = lookahead();

	        if (token.type === Token.Keyword) {
	            switch (token.value) {
	            case 'const':
	            case 'let':
	                return parseConstLetDeclaration(token.value);
	            case 'function':
	                return parseFunctionDeclaration();
	            default:
	                return parseStatement();
	            }
	        }

	        if (token.type !== Token.EOF) {
	            return parseStatement();
	        }
	    }

	    function parseSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted;

	        while (index < length) {
	            token = lookahead();
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }

	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }

	        while (index < length) {
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	        return sourceElements;
	    }

	    function parseProgram() {
	        var program;
	        strict = false;
	        program = {
	            type: Syntax.Program,
	            body: parseSourceElements()
	        };
	        return program;
	    }

	    // The following functions are needed only when the option to preserve
	    // the comments is active.

	    function addComment(type, value, start, end, loc) {
	        assert(typeof start === 'number', 'Comment must have valid position');

	        // Because the way the actual token is scanned, often the comments
	        // (if any) are skipped twice during the lexical analysis.
	        // Thus, we need to skip adding a comment if the comment array already
	        // handled it.
	        if (extra.comments.length > 0) {
	            if (extra.comments[extra.comments.length - 1].range[1] > start) {
	                return;
	            }
	        }

	        extra.comments.push({
	            type: type,
	            value: value,
	            range: [start, end],
	            loc: loc
	        });
	    }

	    function scanComment() {
	        var comment, ch, loc, start, blockComment, lineComment;

	        comment = '';
	        blockComment = false;
	        lineComment = false;

	        while (index < length) {
	            ch = source[index];

	            if (lineComment) {
	                ch = source[index++];
	                if (isLineTerminator(ch)) {
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    lineComment = false;
	                    addComment('Line', comment, start, index - 1, loc);
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    lineStart = index;
	                    comment = '';
	                } else if (index >= length) {
	                    lineComment = false;
	                    comment += ch;
	                    loc.end = {
	                        line: lineNumber,
	                        column: length - lineStart
	                    };
	                    addComment('Line', comment, start, length, loc);
	                } else {
	                    comment += ch;
	                }
	            } else if (blockComment) {
	                if (isLineTerminator(ch)) {
	                    if (ch === '\r' && source[index + 1] === '\n') {
	                        ++index;
	                        comment += '\r\n';
	                    } else {
	                        comment += ch;
	                    }
	                    ++lineNumber;
	                    ++index;
	                    lineStart = index;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    ch = source[index++];
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                    comment += ch;
	                    if (ch === '*') {
	                        ch = source[index];
	                        if (ch === '/') {
	                            comment = comment.substr(0, comment.length - 1);
	                            blockComment = false;
	                            ++index;
	                            loc.end = {
	                                line: lineNumber,
	                                column: index - lineStart
	                            };
	                            addComment('Block', comment, start, index, loc);
	                            comment = '';
	                        }
	                    }
	                }
	            } else if (ch === '/') {
	                ch = source[index + 1];
	                if (ch === '/') {
	                    loc = {
	                        start: {
	                            line: lineNumber,
	                            column: index - lineStart
	                        }
	                    };
	                    start = index;
	                    index += 2;
	                    lineComment = true;
	                    if (index >= length) {
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        lineComment = false;
	                        addComment('Line', comment, start, index, loc);
	                    }
	                } else if (ch === '*') {
	                    start = index;
	                    index += 2;
	                    blockComment = true;
	                    loc = {
	                        start: {
	                            line: lineNumber,
	                            column: index - lineStart - 2
	                        }
	                    };
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    break;
	                }
	            } else if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch ===  '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else {
	                break;
	            }
	        }
	    }

	    function filterCommentLocation() {
	        var i, entry, comment, comments = [];

	        for (i = 0; i < extra.comments.length; ++i) {
	            entry = extra.comments[i];
	            comment = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (extra.range) {
	                comment.range = entry.range;
	            }
	            if (extra.loc) {
	                comment.loc = entry.loc;
	            }
	            comments.push(comment);
	        }

	        extra.comments = comments;
	    }

	    function collectToken() {
	        var start, loc, token, range, value;

	        skipComment();
	        start = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        token = extra.advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };

	        if (token.type !== Token.EOF) {
	            range = [token.range[0], token.range[1]];
	            value = sliceSource(token.range[0], token.range[1]);
	            extra.tokens.push({
	                type: TokenName[token.type],
	                value: value,
	                range: range,
	                loc: loc
	            });
	        }

	        return token;
	    }

	    function collectRegex() {
	        var pos, loc, regex, token;

	        skipComment();

	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        regex = extra.scanRegExp();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };

	        // Pop the previous token, which is likely '/' or '/='
	        if (extra.tokens.length > 0) {
	            token = extra.tokens[extra.tokens.length - 1];
	            if (token.range[0] === pos && token.type === 'Punctuator') {
	                if (token.value === '/' || token.value === '/=') {
	                    extra.tokens.pop();
	                }
	            }
	        }

	        extra.tokens.push({
	            type: 'RegularExpression',
	            value: regex.literal,
	            range: [pos, index],
	            loc: loc
	        });

	        return regex;
	    }

	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];

	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }

	        extra.tokens = tokens;
	    }

	    function createLiteral(token) {
	        return {
	            type: Syntax.Literal,
	            value: token.value
	        };
	    }

	    function createRawLiteral(token) {
	        return {
	            type: Syntax.Literal,
	            value: token.value,
	            raw: sliceSource(token.range[0], token.range[1])
	        };
	    }

	    function createLocationMarker() {
	        var marker = {};

	        marker.range = [index, index];
	        marker.loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            },
	            end: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        marker.end = function () {
	            this.range[1] = index;
	            this.loc.end.line = lineNumber;
	            this.loc.end.column = index - lineStart;
	        };

	        marker.applyGroup = function (node) {
	            if (extra.range) {
	                node.groupRange = [this.range[0], this.range[1]];
	            }
	            if (extra.loc) {
	                node.groupLoc = {
	                    start: {
	                        line: this.loc.start.line,
	                        column: this.loc.start.column
	                    },
	                    end: {
	                        line: this.loc.end.line,
	                        column: this.loc.end.column
	                    }
	                };
	            }
	        };

	        marker.apply = function (node) {
	            if (extra.range) {
	                node.range = [this.range[0], this.range[1]];
	            }
	            if (extra.loc) {
	                node.loc = {
	                    start: {
	                        line: this.loc.start.line,
	                        column: this.loc.start.column
	                    },
	                    end: {
	                        line: this.loc.end.line,
	                        column: this.loc.end.column
	                    }
	                };
	            }
	        };

	        return marker;
	    }

	    function trackGroupExpression() {
	        var marker, expr;

	        skipComment();
	        marker = createLocationMarker();
	        expect('(');

	        expr = parseExpression();

	        expect(')');

	        marker.end();
	        marker.applyGroup(expr);

	        return expr;
	    }

	    function trackLeftHandSideExpression() {
	        var marker, expr;

	        skipComment();
	        marker = createLocationMarker();

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        while (match('.') || match('[')) {
	            if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            }
	        }

	        return expr;
	    }

	    function trackLeftHandSideExpressionAllowCall() {
	        var marker, expr;

	        skipComment();
	        marker = createLocationMarker();

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        while (match('.') || match('[') || match('(')) {
	            if (match('(')) {
	                expr = {
	                    type: Syntax.CallExpression,
	                    callee: expr,
	                    'arguments': parseArguments()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            }
	        }

	        return expr;
	    }

	    function filterGroup(node) {
	        var n, i, entry;

	        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
	        for (i in node) {
	            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
	                entry = node[i];
	                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
	                    n[i] = entry;
	                } else {
	                    n[i] = filterGroup(entry);
	                }
	            }
	        }
	        return n;
	    }

	    function wrapTrackingFunction(range, loc) {

	        return function (parseFunction) {

	            function isBinary(node) {
	                return node.type === Syntax.LogicalExpression ||
	                    node.type === Syntax.BinaryExpression;
	            }

	            function visit(node) {
	                var start, end;

	                if (isBinary(node.left)) {
	                    visit(node.left);
	                }
	                if (isBinary(node.right)) {
	                    visit(node.right);
	                }

	                if (range) {
	                    if (node.left.groupRange || node.right.groupRange) {
	                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
	                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
	                        node.range = [start, end];
	                    } else if (typeof node.range === 'undefined') {
	                        start = node.left.range[0];
	                        end = node.right.range[1];
	                        node.range = [start, end];
	                    }
	                }
	                if (loc) {
	                    if (node.left.groupLoc || node.right.groupLoc) {
	                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
	                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
	                        node.loc = {
	                            start: start,
	                            end: end
	                        };
	                    } else if (typeof node.loc === 'undefined') {
	                        node.loc = {
	                            start: node.left.loc.start,
	                            end: node.right.loc.end
	                        };
	                    }
	                }
	            }

	            return function () {
	                var marker, node;

	                skipComment();

	                marker = createLocationMarker();
	                node = parseFunction.apply(null, arguments);
	                marker.end();

	                if (range && typeof node.range === 'undefined') {
	                    marker.apply(node);
	                }

	                if (loc && typeof node.loc === 'undefined') {
	                    marker.apply(node);
	                }

	                if (isBinary(node)) {
	                    visit(node);
	                }

	                return node;
	            };
	        };
	    }

	    function patch() {

	        var wrapTracking;

	        if (extra.comments) {
	            extra.skipComment = skipComment;
	            skipComment = scanComment;
	        }

	        if (extra.raw) {
	            extra.createLiteral = createLiteral;
	            createLiteral = createRawLiteral;
	        }

	        if (extra.range || extra.loc) {

	            extra.parseGroupExpression = parseGroupExpression;
	            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
	            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
	            parseGroupExpression = trackGroupExpression;
	            parseLeftHandSideExpression = trackLeftHandSideExpression;
	            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;

	            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);

	            extra.parseAdditiveExpression = parseAdditiveExpression;
	            extra.parseAssignmentExpression = parseAssignmentExpression;
	            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
	            extra.parseBitwiseORExpression = parseBitwiseORExpression;
	            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
	            extra.parseBlock = parseBlock;
	            extra.parseFunctionSourceElements = parseFunctionSourceElements;
	            extra.parseCatchClause = parseCatchClause;
	            extra.parseComputedMember = parseComputedMember;
	            extra.parseConditionalExpression = parseConditionalExpression;
	            extra.parseConstLetDeclaration = parseConstLetDeclaration;
	            extra.parseEqualityExpression = parseEqualityExpression;
	            extra.parseExpression = parseExpression;
	            extra.parseForVariableDeclaration = parseForVariableDeclaration;
	            extra.parseFunctionDeclaration = parseFunctionDeclaration;
	            extra.parseFunctionExpression = parseFunctionExpression;
	            extra.parseLogicalANDExpression = parseLogicalANDExpression;
	            extra.parseLogicalORExpression = parseLogicalORExpression;
	            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
	            extra.parseNewExpression = parseNewExpression;
	            extra.parseNonComputedProperty = parseNonComputedProperty;
	            extra.parseObjectProperty = parseObjectProperty;
	            extra.parseObjectPropertyKey = parseObjectPropertyKey;
	            extra.parsePostfixExpression = parsePostfixExpression;
	            extra.parsePrimaryExpression = parsePrimaryExpression;
	            extra.parseProgram = parseProgram;
	            extra.parsePropertyFunction = parsePropertyFunction;
	            extra.parseRelationalExpression = parseRelationalExpression;
	            extra.parseStatement = parseStatement;
	            extra.parseShiftExpression = parseShiftExpression;
	            extra.parseSwitchCase = parseSwitchCase;
	            extra.parseUnaryExpression = parseUnaryExpression;
	            extra.parseVariableDeclaration = parseVariableDeclaration;
	            extra.parseVariableIdentifier = parseVariableIdentifier;

	            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
	            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
	            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
	            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
	            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
	            parseBlock = wrapTracking(extra.parseBlock);
	            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
	            parseCatchClause = wrapTracking(extra.parseCatchClause);
	            parseComputedMember = wrapTracking(extra.parseComputedMember);
	            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
	            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
	            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
	            parseExpression = wrapTracking(extra.parseExpression);
	            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
	            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
	            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
	            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
	            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
	            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
	            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
	            parseNewExpression = wrapTracking(extra.parseNewExpression);
	            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
	            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
	            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
	            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
	            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
	            parseProgram = wrapTracking(extra.parseProgram);
	            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
	            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
	            parseStatement = wrapTracking(extra.parseStatement);
	            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
	            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
	            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
	            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
	            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
	        }

	        if (typeof extra.tokens !== 'undefined') {
	            extra.advance = advance;
	            extra.scanRegExp = scanRegExp;

	            advance = collectToken;
	            scanRegExp = collectRegex;
	        }
	    }

	    function unpatch() {
	        if (typeof extra.skipComment === 'function') {
	            skipComment = extra.skipComment;
	        }

	        if (extra.raw) {
	            createLiteral = extra.createLiteral;
	        }

	        if (extra.range || extra.loc) {
	            parseAdditiveExpression = extra.parseAdditiveExpression;
	            parseAssignmentExpression = extra.parseAssignmentExpression;
	            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
	            parseBitwiseORExpression = extra.parseBitwiseORExpression;
	            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
	            parseBlock = extra.parseBlock;
	            parseFunctionSourceElements = extra.parseFunctionSourceElements;
	            parseCatchClause = extra.parseCatchClause;
	            parseComputedMember = extra.parseComputedMember;
	            parseConditionalExpression = extra.parseConditionalExpression;
	            parseConstLetDeclaration = extra.parseConstLetDeclaration;
	            parseEqualityExpression = extra.parseEqualityExpression;
	            parseExpression = extra.parseExpression;
	            parseForVariableDeclaration = extra.parseForVariableDeclaration;
	            parseFunctionDeclaration = extra.parseFunctionDeclaration;
	            parseFunctionExpression = extra.parseFunctionExpression;
	            parseGroupExpression = extra.parseGroupExpression;
	            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
	            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
	            parseLogicalANDExpression = extra.parseLogicalANDExpression;
	            parseLogicalORExpression = extra.parseLogicalORExpression;
	            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
	            parseNewExpression = extra.parseNewExpression;
	            parseNonComputedProperty = extra.parseNonComputedProperty;
	            parseObjectProperty = extra.parseObjectProperty;
	            parseObjectPropertyKey = extra.parseObjectPropertyKey;
	            parsePrimaryExpression = extra.parsePrimaryExpression;
	            parsePostfixExpression = extra.parsePostfixExpression;
	            parseProgram = extra.parseProgram;
	            parsePropertyFunction = extra.parsePropertyFunction;
	            parseRelationalExpression = extra.parseRelationalExpression;
	            parseStatement = extra.parseStatement;
	            parseShiftExpression = extra.parseShiftExpression;
	            parseSwitchCase = extra.parseSwitchCase;
	            parseUnaryExpression = extra.parseUnaryExpression;
	            parseVariableDeclaration = extra.parseVariableDeclaration;
	            parseVariableIdentifier = extra.parseVariableIdentifier;
	        }

	        if (typeof extra.scanRegExp === 'function') {
	            advance = extra.advance;
	            scanRegExp = extra.scanRegExp;
	        }
	    }

	    function stringToArray(str) {
	        var length = str.length,
	            result = [],
	            i;
	        for (i = 0; i < length; ++i) {
	            result[i] = str.charAt(i);
	        }
	        return result;
	    }

	    function parse(code, options) {
	        var program, toString;

	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }

	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        buffer = null;
	        state = {
	            allowIn: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false
	        };

	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.raw = (typeof options.raw === 'boolean') && options.raw;
	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	        }

	        if (length > 0) {
	            if (typeof source[0] === 'undefined') {
	                // Try first to convert to a string. This is good as fast path
	                // for old IE which understands string indexing for string
	                // literals only and not for string object.
	                if (code instanceof String) {
	                    source = code.valueOf();
	                }

	                // Force accessing the characters via an array.
	                if (typeof source[0] === 'undefined') {
	                    source = stringToArray(code);
	                }
	            }
	        }

	        patch();
	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                filterCommentLocation();
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	            if (extra.range || extra.loc) {
	                program.body = filterGroup(program.body);
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            unpatch();
	            extra = {};
	        }

	        return program;
	    }

	    // Sync with package.json.
	    exports.version = '1.0.4';

	    exports.parse = parse;

	    // Deep copy.
	    exports.Syntax = (function () {
	        var name, types = {};

	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }

	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }

	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }

	        return types;
	    }());

	}));
	/* vim: set sw=4 ts=4 et tw=80 : */


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = hoist

	function hoist(ast){

	  var parentStack = []
	  var variables = []
	  var functions = []

	  if (Array.isArray(ast)){

	    walkAll(ast)
	    prependScope(ast, variables, functions)
	    
	  } else {
	    walk(ast)
	  }

	  return ast

	  // walk through each node of a program of block statement
	  function walkAll(nodes){
	    var result = null
	    for (var i=0;i<nodes.length;i++){
	      var childNode = nodes[i]
	      if (childNode.type === 'EmptyStatement') continue
	      var result = walk(childNode)
	      if (result === 'remove'){
	        nodes.splice(i--, 1)
	      }
	    }
	  }

	  function walk(node){
	    var parent = parentStack[parentStack.length-1]
	    var remove = false
	    parentStack.push(node)

	    var excludeBody = false
	    if (shouldScope(node, parent)){
	      hoist(node.body)
	      excludeBody = true
	    }

	    if (node.type === 'VariableDeclarator'){
	      variables.push(node)
	    }

	    if (node.type === 'FunctionDeclaration'){
	      functions.push(node)
	      remove = true
	    }

	    for (var key in node){
	      if (key === 'type' || (excludeBody && key === 'body')) continue
	      if (key in node && node[key] && typeof node[key] == 'object'){
	        if (node[key].type){
	          walk(node[key])
	        } else if (Array.isArray(node[key])){
	          walkAll(node[key])
	        }
	      }
	    }

	    parentStack.pop()
	    if (remove){
	      return 'remove'
	    }
	  }
	}

	function shouldScope(node, parent){
	  if (node.type === 'Program'){
	    return true
	  } else if (node.type === 'BlockStatement'){
	    if (parent && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')){
	      return true
	    }
	  }
	}

	function prependScope(nodes, variables, functions){
	  if (variables && variables.length){
	    var declarations = []
	    for (var i=0;i<variables.length;i++){
	      declarations.push({
	        type: 'VariableDeclarator', 
	        id: variables[i].id,
	        init: null
	      })
	    }
	    
	    nodes.unshift({
	      type: 'VariableDeclaration', 
	      kind: 'var', 
	      declarations: declarations
	    })

	  }

	  if (functions && functions.length){
	    for (var i=0;i<functions.length;i++){
	      nodes.unshift(functions[i]) 
	    }
	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = InfiniteChecker

	function InfiniteChecker(maxIterations){
	  if (this instanceof InfiniteChecker){
	    this.maxIterations = maxIterations
	    this.count = 0
	  } else {
	    return new InfiniteChecker(maxIterations)
	  }
	}

	InfiniteChecker.prototype.check = function(){
	  this.count += 1
	  if (this.count > this.maxIterations){
	    throw new Error('Infinite loop detected - reached max iterations')
	  }
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var names = ['Object', 'String', 'Boolean', 'Number', 'RegExp', 'Date', 'Array']
	var immutable = {string: 'String', boolean: 'Boolean', number: 'Number' }

	var primitives = names.map(getGlobal)
	var protos = primitives.map(getProto)

	var protoReplacements = {}

	module.exports = Primitives

	function Primitives(context){
	  if (this instanceof Primitives){
	    this.context = context
	    for (var i=0;i<names.length;i++){
	      if (!this.context[names[i]]){
	        this.context[names[i]] = wrap(primitives[i])
	      }
	    }
	  } else {
	    return new Primitives(context)
	  }
	}

	Primitives.prototype.replace = function(value){
	  var primIndex = primitives.indexOf(value)
	  var protoIndex = protos.indexOf(value)

	  if (~primIndex){
	    var name = names[primIndex]
	    return this.context[name]
	  } else if (~protoIndex) {
	    var name = names[protoIndex]
	    return this.context[name].prototype
	  } else  {
	    return value
	  }
	}

	Primitives.prototype.getPropertyObject = function(object, property){
	  if (immutable[typeof object]){
	    return this.getPrototypeOf(object)
	  }
	  return object
	}

	Primitives.prototype.isPrimitive = function(value){
	  return !!~primitives.indexOf(value) || !!~protos.indexOf(value)
	}

	Primitives.prototype.getPrototypeOf = function(value){
	  if (value == null){ // handle null and undefined
	    return value
	  }

	  var immutableType = immutable[typeof value]
	  if (immutableType){
	    var proto = this.context[immutableType].prototype
	  } else {
	    var proto = Object.getPrototypeOf(value)
	  }

	  if (!proto || proto === Object.prototype){
	    return null
	  } else {
	    var replacement = this.replace(proto)
	    if (replacement === value){
	      replacement = this.replace(Object.prototype)
	    }
	    return replacement
	  }
	}

	Primitives.prototype.applyNew = function(func, args){
	  if (func.wrapped){
	    var prim = Object.getPrototypeOf(func)
	    var instance = new (Function.prototype.bind.apply(prim, arguments))
	    setProto(instance, func.prototype)
	    return instance
	  } else {
	    return new (Function.prototype.bind.apply(func, arguments))
	  }
	}

	function getProto(func){
	  return func.prototype
	}

	function getGlobal(str){
	  return global[str]
	}

	function setProto(obj, proto){
	  obj.__proto__ = proto
	}

	function wrap(prim){
	  var proto = Object.create(prim.prototype)

	  var result = function() {
	    if (this instanceof result){
	      prim.apply(this, arguments)
	    } else {
	      var instance = prim.apply(null, arguments)
	      setProto(instance, proto)
	      return instance
	    }
	  }
	  setProto(result, prim)
	  result.prototype = proto
	  result.wrapped = true
	  return result
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);