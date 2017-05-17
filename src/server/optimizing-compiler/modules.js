/* @flow */

import {
  RAW,
  // INTERPOLATION,
  EXPRESSION
} from './codegen'

import {
  propsToAttrMap,
  isRenderableAttr
} from 'web/server/util'

import type { StringSegment } from './codegen'
import type { CodegenState } from 'compiler/codegen/index'

type Attr = { name: string; value: string };

const plainStringRE = /^"(?:[^"\\]|\\.)*"$|^'(?:[^'\\]|\\.)*'$/

// let the model AST transform translate v-model into appropriate
// props bindings
export function applyModelTransform (el: ASTElement, state: CodegenState) {
  if (el.directives) {
    for (let i = 0; i < el.directives.length; i++) {
      const dir = el.directives[i]
      if (dir.name === 'model') {
        state.directives.model(el, dir, state.warn)
        break
      }
    }
  }
}

export function genAttrSegments (
  attrs: Array<Attr>
): Array<StringSegment> {
  return attrs.map(({ name, value }) => genAttrSegment(name, value))
}

export function genDOMPropSegments (
  props: Array<Attr>,
  attrs: ?Array<Attr>
): Array<StringSegment> {
  const segments = []
  props.forEach(({ name, value }) => {
    name = propsToAttrMap[name] || name.toLowerCase()
    if (isRenderableAttr(name) &&
      !(attrs && attrs.some(a => a.name === name))
    ) {
      segments.push(genAttrSegment(name, value))
    }
  })
  return segments
}

function genAttrSegment (name: string, value: string): StringSegment {
  if (plainStringRE.test(value)) {
    return {
      type: RAW,
      value: value === '""'
        ? ` ${name}`
        : ` ${name}=${value}`
    }
  } else {
    return {
      type: EXPRESSION,
      value: `_ssrAttr(${JSON.stringify(name)},${value})`
    }
  }
}

export function genClassSegments (
  staticClass: ?string,
  classBinding: ?string
): Array<StringSegment> {
  if (staticClass && !classBinding) {
    return [{ type: RAW, value: ` class=${staticClass}` }]
  } else {
    return [{
      type: EXPRESSION,
      value: `_ssrClass(${staticClass || 'null'},${classBinding || 'null'})`
    }]
  }
}

export function genStyleSegments (
  staticStyle: ?string,
  styleBinding: ?string,
  vShowExpression: ?string
): Array<StringSegment> {
  return []
}
