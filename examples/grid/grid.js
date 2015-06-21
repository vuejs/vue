// register the grid component
Vue.component('demo-grid', {
  template: '#grid-template',
  replace: true,
  props: ['data', 'columns', 'filter-key'],
  data: function () {
    var reversed = {}
    this.columns.forEach(function (key) {
      reversed[key] = false
    })
    return {
      data: null,
      columns: null,
      sortKey: '',
      filterKey: '',
      reversed: reversed
    }
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
    searchQuery: '',
    gridColumns: ['name', 'power'],
    gridData: [
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jacky Chang', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ]
  }
})
