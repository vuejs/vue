import {
  getBindingAttr
} from 'compiler/helpers'

function parse (el, options) {
  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function genData (el, data) {
  if (el.styleBinding) {
    data += `style:${el.styleBinding},`
  }
  return data
}

export default {
  staticKeys: [],
  parse,
  genData
}
