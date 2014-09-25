// register the grid component
Vue.component('demo-grid', {
  template: '#grid-template',
  replace: true,
  data: function () {
    return {
      columns: null,
      sortKey: '',
      filterKey: '',
      reversed: {}
    }
  },
  compiled: function () {
    // initialize reverse state
    var self = this
    this.columns.forEach(function (key) {
      self.reversed.$add(key, false)
    })
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.reversed[key] = !this.reversed[key]
    }
  }
})

// bootstrap the demo
var demo = new Vue({
  el: '#demo',
  data: {
    search: '',
    gridColumns: ['name', 'power'],
    gridData: [
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jacky Chang', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ]
  }
})