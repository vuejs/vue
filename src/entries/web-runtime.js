import Vue from '../runtime/index'
import { update } from '../runtime/dom-updater/index'

Vue.prototype.__update__ = update

export default Vue
