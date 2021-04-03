const Vue = require('vue/dist/vue.common')
const FullVue = require('vue/dist/vue.runtime.common')
const plugin = require('../src').default

FullVue.config.productionTip = false
FullVue.config.devtools = false
Vue.config.productionTip = false
Vue.config.devtools = false
Vue.use(plugin)
