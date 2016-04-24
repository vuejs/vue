import attrs from './modules/attrs'
import klass from './modules/class'
import style from './modules/style'
import show from './directives/show'
import { renderToString } from './render-to-string'
import { renderToStream } from './render-to-stream'

export function createComponentRenderer (options = {}) {
  const modules = Object.assign({
    attrs,
    style,
    class: klass
  }, options.modules)

  const directives = Object.assign({
    show
  }, options.directives)

  return {
    renderToString: component => renderToString(component, modules, directives),
    renderToStream: component => renderToStream(component, modules, directives)
  }
}
