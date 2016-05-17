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

function genData (el) {
  if (el.transition) {
    return `transition:{definition:(${el.transition}),appear:${el.transitionOnAppear}},`
  }
  return ''
}

export default {
  staticKeys: [],
  parse,
  genData
}
