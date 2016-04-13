import Vue from './instance/index'
import { nextTick } from './util/index'

Vue.options = {
  directives: Object.create(null),
  filters: Object.create(null),
  components: Object.create(null),
  transitions: Object.create(null)
}

Vue.nextTick = nextTick
Vue.version = '2.0.0'

export default Vue
