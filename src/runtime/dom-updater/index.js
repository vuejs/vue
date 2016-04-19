import createUpdater from '../vdom/create-updater'
import * as nodeOps from './node-ops'
import classes from './modules/class'
import style from './modules/style'
import props from './modules/props'
import attrs from './modules/attrs'
import events from './modules/events'
import directives from './modules/directives'

export const update = createUpdater({
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
