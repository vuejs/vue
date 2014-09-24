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
  ready: function () {
    // assuming all data entries have the same keys
    // extract the column headers
    this.columns = Object.keys(this.data[0])
    // initialize column reverse state
    this.columns.forEach(function (key) {
      this.reversed.$add(key, false)
    }.bind(this))
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
    gridData: [
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jacky Chang', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ]
  }
})