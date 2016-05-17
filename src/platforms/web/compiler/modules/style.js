import {
  getBindingAttr
} from 'compiler/helpers'

function parse (el, options) {
  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function genData (el) {
  if (el.styleBinding) {
    return `style:${el.styleBinding},`
  }
  return ''
}

export default {
  staticKeys: [],
  parse,
  genData
}
