import {
  getBindingAttr
} from 'compiler/helpers'

function parse (el, options) {
  let transition = getBindingAttr(el, 'transition')
  if (transition === '""') {
    transition = true
  }
  if (transition) {
    el.transition = transition
    el.transitionOnAppear = getBindingAttr(el, 'transition-on-appear') != null
  }
}

function genData (el, data) {
  if (el.transition) {
    data += `transition:{definition:(${el.transition}),appear:${el.transitionOnAppear}},`
  }
  return data
}

export default {
  staticKeys: [],
  parse,
  genData
}
