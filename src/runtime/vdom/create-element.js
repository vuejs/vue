import VNode from './vnode'
import Component from './component'
import { flatten } from './helpers'
import { renderState } from '../instance/render'
import { warn, isReservedTag, isUnknownElement, resolveAsset } from '../util/index'

export default function createElement (tag, data, children) {
  data = data || {}
  const context = this
  const parent = renderState.activeInstance
  if (typeof tag === 'string') {
    let Ctor
    if (isReservedTag(tag)) {
      return VNode(tag, data, flatten(children))
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      return Component(Ctor, data, parent, children)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (!data.svg && isUnknownElement(tag)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.'
          )
        }
      }
      return VNode(tag, data, flatten(children && children()))
    }
  } else {
    return Component(tag, data, parent, children)
  }
}
