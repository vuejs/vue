/* @flow */

import { addHandler, addAttr, parseModel } from 'compiler/helpers'

export default function model (
  el: ASTElement,
  dir: ASTDirective,
  _warn: Function
): ?boolean {
  genDefaultModel(el, dir.value, dir.modifiers)
}

function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const { lazy, trim } = modifiers || {}
  const event = lazy ? 'change' : 'input'
  const isNative = el.tag === 'input' || el.tag === 'textarea'
  const valueExpression = isNative
    ? `$event.target.attr.value${trim ? '.trim()' : ''}`
    : `$event`
  const code = genAssignmentCode(value, valueExpression)
  addAttr(el, 'value', `(${value})`)
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
