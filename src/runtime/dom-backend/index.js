import createPatchFunction from '../vdom/patch'
import * as nodeOps from './node-ops'
import classes from './modules/class'
import style from './modules/style'
import props from './modules/props'
import attrs from './modules/attrs'
import events from './modules/events'
import directives from './modules/directives'

export const patch = createPatchFunction({
  nodeOps,
  modules: [
    classes,
    props,
    attrs,
    style,
    events,
    directives
  ]
})
