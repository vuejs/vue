// define the child component
Vue.component('child', {
  template: '#child-template',
  data: function () {
    return {
      state: {
        created: false,
        ready: false
      }
    }
  },
  created: function() {
    this.state.created = true
  },
  ready: function() {
    this.state.ready = true
  }
})

// boot up the demo
var parent = new Vue({
  el: '#demo',
  data: {
    state: {
      created: false,
      ready: false
    }
  },
  created: function() {
    this.state.created = true
  },
  ready: function() {
    this.state.ready = true
  }
})
