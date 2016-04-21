import Vue from '../runtime/index'
import { patch } from '../runtime/dom/index'

Vue.prototype.__patch__ = patch

export default Vue
