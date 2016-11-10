/* @flow */

import { addHandler, addProp, parseModel } from 'compiler/helpers'

let warn

export default function model (
  el: ASTElement,
  dir: ASTDirective,
  _warn: Function
): ?boolean {
  warn = _warn
  genDefaultModel(el, dir.value, dir.modifiers)
  return true
}

function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const type = el.attrsMap.type
  const { lazy } = modifiers || {}
  const event = lazy ? 'change' : 'input'
  const code = genAssignmentCode(value, `$event`)
  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code, null, true)
}

function genAssignmentCode (value: string, assignment: string): string {
  const modelRs = parseModel(value)
  if (modelRs.idx === null) {
    return `${value}=${assignment}`
  } else {
    return `var $$exp = ${modelRs.exp}, $$idx = ${modelRs.idx};` +
      `if (!Array.isArray($$exp)){` +
        `${value}=${assignment}}` +
      `else{$$exp.splice($$idx, 1, ${assignment})}`
  }
}
