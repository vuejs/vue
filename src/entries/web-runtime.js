import Vue from '../runtime/index'
import { patch } from '../runtime/vdom-web/index'

Vue.prototype.__patch__ = patch

export default Vue
