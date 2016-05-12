import VNode, { emptyVNode } from './vnode'
import config from '../config'
import { createComponent } from './create-component'
import { flatten } from './helpers'
import { renderState } from '../instance/render'
import { warn, resolveAsset } from '../util/index'

export default function createElement (tag, data, children, namespace) {
  const context = this
  const parent = renderState.activeInstance
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode
  }
  if (typeof tag === 'string') {
    let Ctor
    if (config.isReservedTag(tag)) {
      return new VNode(
        tag, data, flatten(children),
        undefined, undefined, namespace, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      return createComponent(Ctor, data, parent, children, context)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (!namespace && config.isUnknownElement(tag)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
      return new VNode(
        tag, data, flatten(children && children()),
        undefined, undefined, namespace, context
      )
    }
  } else {
    return createComponent(tag, data, parent, children, context)
  }
}
