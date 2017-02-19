/* @flow */

function preTransformNode (el: ASTElement, options: CompilerOptions) {
  if (el.tag === 'cell' && !el.attrsList.some(item => item.name === 'append')) {
    el.attrsMap.append = 'tree'
    el.attrsList.push({ name: 'append', value: 'tree' })
  }
  if (el.attrsMap.append === 'tree') {
    el.appendAsTree = true
  }
}

function genData (el: ASTElement): string {
  return el.appendAsTree ? `appendAsTree:true,` : ''
}

export default {
  staticKeys: ['appendAsTree'],
  preTransformNode,
  genData
}
