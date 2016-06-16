/* @flow */

import { dirRE } from './parser/index'

// operators like typeof, instanceof and in are allowed
const prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b')
// check valid identifier for v-for
const identRE = /[A-Za-z_$][\w$]*/

// detect problematic expressions in a template
export function detectErrors (ast: ?ASTNode): Array<string> {
  const errors: Array<string> = []
  if (ast) {
    checkNode(ast, errors)
  }
  return errors
}

function checkNode (node: ASTNode, errors: Array<string>) {
  if (node.type === 1) {
    for (const name in node.attrsMap) {
      if (dirRE.test(name)) {
        const value = node.attrsMap[name]
        if (value) {
          if (name === 'v-for') {
            checkFor(node, `v-for="${value}"`, errors)
          } else {
            checkExpression(value, `${name}="${value}"`, errors)
          }
        }
      }
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], errors)
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, errors)
  }
}

function checkFor (node: ASTElement, text: string, errors: Array<string>) {
  checkExpression(node.for || '', text, errors)
  checkIdentifier(node.alias, 'v-for alias', text, errors)
  checkIdentifier(node.iterator1, 'v-for iterator', text, errors)
  checkIdentifier(node.iterator2, 'v-for iterator', text, errors)
}

function checkIdentifier (ident: ?string, type: string, text: string, errors: Array<string>) {
  if (typeof ident === 'string' && !identRE.test(ident)) {
    errors.push(`- invalid ${type} "${ident}" in expression: ${text}`)
  }
}

function checkExpression (exp: string, text: string, errors: Array<string>) {
  exp = stripToString(exp)
  const keywordMatch = exp.match(prohibitedKeywordRE)
  if (keywordMatch) {
    errors.push(
      `- avoid using JavaScript keyword as property name: ` +
      `"${keywordMatch[0]}" in expression ${text}`
    )
  } else {
    try {
      new Function(`return ${exp}`)
    } catch (e) {
      errors.push(`- invalid expression: ${text}`)
    }
  }
}

function stripToString (exp) {
  return exp.replace(/^_s\((.*)\)$/, '$1')
}
