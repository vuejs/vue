/* @flow */

function transformNode (el: ASTElement, options: CompilerOptions) {
  if (el.attrsMap.append === 'tree') {
    el.appendAsTree = true
  }
}

function genData (el: ASTElement): string {
  return el.appendAsTree ? `appendAsTree:true,` : ''
}

export default {
  staticKeys: ['appendAsTree'],
  transformNode,
  genData
}
