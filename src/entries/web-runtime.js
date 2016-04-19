import Vue from '../runtime/index'
import { patch } from '../runtime/dom-backend/index'

Vue.prototype.__patch__ = patch

export default Vue
