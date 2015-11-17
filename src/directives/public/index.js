// text & html
import text from './text'
import html from './html'
// logic control
import vFor from './for'
import vIf from './if'
import show from './show'
// two-way binding
import model from './model/index'
// event handling
import on from './on'
// attributes
import bind from './bind'
// ref & el
import el from './el'
import ref from './ref'
// cloak
import cloak from './cloak'

// must export plain object
export default {
  text,
  html,
  'for': vFor,
  'if': vIf,
  show,
  model,
  on,
  bind,
  el,
  ref,
  cloak
}
