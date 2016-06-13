/* @flow */

import { dirRE } from './parser/index'

const keywordRE = new RegExp('\\b' + (
  'do,if,in,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,typeof,default,' +
  'extends,finally,continue,debugger,function,arguments,instanceof'
).split(',').join('\\b|\\b') + '\\b')

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
          checkExpression(value, `${name}="${value}"`, errors)
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

function checkExpression (exp: string, text: string, errors: Array<string>) {
  exp = stripToString(exp)
  const keywordMatch = exp.match(keywordRE)
  if (keywordMatch) {
    errors.push(
      `- avoid using JavaScript keyword as property name: ` +
      `"${keywordMatch[0]}" in expression ${text}`
    )
  } else {
    try {
      new Function(exp)
    } catch (e) {
      errors.push(`- invalid expression: ${text}`)
    }
  }
}

function stripToString (exp) {
  return exp.replace(/^_s\((.*)\)$/, '$1')
}
