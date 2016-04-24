import attrs from './modules/attrs'
import klass from './modules/class'
import style from './modules/style'
import show from './directives/show'

export function createRenderer (options) {
  const modules = Object.assign({
    attrs,
    style,
    class: klass
  }, options.modules)

  const directives = Object.assign({
    show
  }, options.directives)

  return {
    renderToString () {

    },
    renderToStream () {

    }
  }
}
