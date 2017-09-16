/* @flow */

import { addAttr } from 'compiler/helpers'

function isVForAttr (name: string): boolean {
  return /^v\-for/.test(name)
}

export function transformVFor (el: ASTElement) {
  for (const attr in el.attrsMap) {
    if (!isVForAttr(attr)) {
      continue
    }
    const desc: Object = {
      '@expression': el.for,
      '@alias': el.alias
    }
    if (el.iterator1) {
      desc['@index'] = el.iterator1
    }
    if (el.iterator2) {
      desc['@key'] = el.iterator1
      desc['@index'] = el.iterator2
    }
    addAttr(el, '[[repeat]]', desc)
    el.attrsMap['[[repeat]]'] = desc
    el.attrsList.push({ name: '[[repeat]]', value: desc })
    delete el.attrsMap[attr]
    delete el.for
    delete el.alias
    delete el.key
    delete el.iterator1
    delete el.iterator2
  }
}
