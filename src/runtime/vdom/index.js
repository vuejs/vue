/**
 * Virtual DOM implementation based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * with custom modifications.
 */

import createPatchFunction from './patch'
import h from './h'
import classes from './modules/class'
import style from './modules/style'
import props from './modules/props'
import attrs from './modules/attrs'
import events from './modules/events'

const patch = createPatchFunction([
  classes,
  props,
  attrs,
  style,
  events
])

export { patch, h }
