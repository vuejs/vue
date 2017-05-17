/* @flow */

// The SSR codegen is essentially extending the default codegen to handle
// SSR-optimizable nodes and turn them into string render fns. In cases where
// a node is not optimizable it simply falls back to the default codegen.

// import * as directives from './directives'
import { optimizability } from './optimizer'
import {
  genIf,
  genFor,
  genData,
  genText,
  genElement,
  genChildren,
  CodegenState
} from 'compiler/codegen/index'

type SSRCompileResult = {
  render: string;
  staticRenderFns: Array<string>;
  stringRenderFns: Array<string>;
};

// segment types
const RAW = 0
const INTERPOLATION = 1
const FLOW_CONTROL = 2

type StringSegment = {
  type: number;
  value: string;
};

class SSRCodegenState extends CodegenState {
  stringRenderFns: Array<string>;

  constructor (options: CompilerOptions) {
    super(options)
    this.stringRenderFns = []
  }
}

export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): SSRCompileResult {
  const state = new SSRCodegenState(options)
  const code = ast ? genSSRElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns,
    stringRenderFns: state.stringRenderFns
  }
}

function genSSRElement (el: ASTElement, state: SSRCodegenState): string {
  if (el.for && !el.forProcessed) {
    return genFor(el, state, genSSRElement)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state, genSSRElement)
  }

  switch (el.ssrOptimizability) {
    case optimizability.FULL:
      // stringify whole tree
      return genStringElement(el, state, true)
    case optimizability.SELF:
      // stringify self and check children
      return genStringElement(el, state, false)
    case optimizability.CHILDREN:
      // generate self as VNode and stringify children
      return genNormalElement(el, state, true)
    case optimizability.PARTIAL:
      // generate self as VNode and check children
      return genNormalElement(el, state, false)
    default:
      // bail whole tree
      return genElement(el, state)
  }
}

function genNormalElement (el, state, stringifyChildren) {
  const data = el.plain ? undefined : genData(el, state)
  const children = stringifyChildren
    ? genStringChildren(el, state)
    : genSSRChildren(el, state, true)
  return `_c('${el.tag}'${
    data ? `,${data}` : ''
  }${
    children ? `,${children}` : ''
  })`
}

function genSSRChildren (el, state, checkSkip) {
  return genChildren(el, state, checkSkip, genSSRElement, genSSRNode)
}

function genSSRNode (el, state) {
  return el.type === 1
    ? genSSRElement(el, state)
    : genText(el, state)
}

function genStringChildren (el, state) {
  return `[_ssrNode(${flattenSegments(childrenToSegments(el, state))})]`
}

function genStringElement (el, state, stringifyChildren) {
  if (stringifyChildren) {
    return `_ssrNode(${flattenSegments(elementToSegments(el, state))})`
  } else {
    const children = genSSRChildren(el, state, true)
    return `_ssrNode(${
      flattenSegments(elementToOpenTagSegments(el, state))
    }","${el.tag}"${
      children ? `,${children}` : ''
    })`
  }
}

function elementToSegments (el, state): Array<StringSegment> {
  if (el.for && !el.forProcessed) {
    el.forProcessed = true
    return [{
      type: FLOW_CONTROL,
      value: genFor(el, state, elementToString, '_ssrList')
    }]
  } else if (el.if && !el.ifProcessed) {
    el.ifProcessed = true
    return [{
      type: FLOW_CONTROL,
      value: genIf(el, state, elementToString, '""')
    }]
  }

  const openSegments = elementToOpenTagSegments(el, state)
  const childrenSegments = childrenToSegments(el, state)
  const { isUnaryTag } = state.options
  const close = (isUnaryTag && isUnaryTag(el.tag))
    ? []
    : [{ type: RAW, value: `</${el.tag}>` }]
  return openSegments.concat(childrenSegments, close)
}

function elementToString (el, state) {
  return flattenSegments(elementToSegments(el, state))
}

function elementToOpenTagSegments (el, state): Array<StringSegment> {
  // TODO: handle v-show, v-html & v-text
  // TODO: handle attrs/props/styles/classes
  return [{ type: RAW, value: `<${el.tag}>` }]
}

function childrenToSegments (el, state): Array<StringSegment> {
  const children = el.children
  if (children) {
    const segments = []
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (c.type === 1) {
        segments.push.apply(segments, elementToSegments(c, state))
      } else if (c.type === 2) {
        segments.push({ type: INTERPOLATION, value: c.expression })
      } else if (c.type === 3) {
        segments.push({ type: RAW, value: c.text })
      }
    }
    return segments
  } else {
    return []
  }
}

function flattenSegments (segments: Array<StringSegment>): string {
  const mergedSegments = []
  let textBuffer = ''

  const pushBuffer = () => {
    if (textBuffer) {
      mergedSegments.push(JSON.stringify(textBuffer))
      textBuffer = ''
    }
  }

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    if (s.type === RAW) {
      textBuffer += s.value
    } else if (s.type === INTERPOLATION) {
      pushBuffer()
      mergedSegments.push(`_ssrEscape(${s.value})`)
    } else if (s.type === FLOW_CONTROL) {
      pushBuffer()
      mergedSegments.push(`(${s.value})`)
    }
  }
  pushBuffer()

  return mergedSegments.join('+')
}
