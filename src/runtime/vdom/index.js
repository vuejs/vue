/**
 * Virtual DOM implementation based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * with custom modifications.
 */

import createPatchFunction from './patch'
import createElement from './create-element'
import classes from './modules/class'
import style from './modules/style'
import props from './modules/props'
import attrs from './modules/attrs'
import events, { updateListeners } from './modules/events'
import directives from './modules/directives'

const patch = createPatchFunction([
  classes,
  props,
  attrs,
  style,
  events,
  directives
])

export { patch, createElement, updateListeners }
