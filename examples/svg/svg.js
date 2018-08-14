// The raw data to observe
var stats = [
  { label: 'A', value: 100, id: "f0237749-e575-4c42-bef1-a7e6867d1b62" },
  { label: 'B', value: 100, id: "2e7096de-dbd1-4e09-8b82-afc9b6f6ccea" },
  { label: 'C', value: 100, id: "b0533577-bd55-4be5-a3d4-819699114cf4" },
  { label: 'D', value: 100, id: "39e3a678-2d4c-46d9-baaf-72949f599ef5" },
  { label: 'E', value: 100, id: "59c86723-7471-445b-9ad9-f2cd20fe30a6" },
  { label: 'F', value: 100, id: "67810472-a8e8-4f36-951a-9a11d9546d3e" }
]

// A reusable polygon graph component
Vue.component('polygraph', {
  props: ['stats'],
  template: '#polygraph-template',
  computed: {
    // a computed property for the polygon's points
    points: function () {
      var total = this.stats.length
      return this.stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, total)
        return point.x + ',' + point.y
      }).join(' ')
    }
  },
  components: {
    // a sub component for the labels
    'axis-label': {
      props: {
        stat: Object,
        index: Number,
        total: Number
      },
      template: '#axis-label-template',
      computed: {
        point: function () {
          return valueToPoint(
            +this.stat.value + 10,
            this.index,
            this.total
          )
        }
      }
    }
  }
})

// math helper...
function valueToPoint (value, index, total) {
  var x     = 0
  var y     = -value * 0.8
  var angle = Math.PI * 2 / total * index
  var cos   = Math.cos(angle)
  var sin   = Math.sin(angle)
  var tx    = x * cos - y * sin + 100
  var ty    = x * sin + y * cos + 100
  return {
    x: tx,
    y: ty
  }
}

function genId() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

// bootstrap the demo
new Vue({
  el: '#demo',
  data: {
    newLabel: '',
    stats: stats
  },
  methods: {
    add: function (e) {
      e.preventDefault()
      if (!this.newLabel) return
      this.stats.push({
        label: this.newLabel,
        value: 100,
        id: genId()
      })
      this.newLabel = ''
    },
    remove: function (stat) {
      if (this.stats.length > 3) {
        this.stats.splice(this.stats.indexOf(stat), 1)
      } else {
        alert('Can\'t delete more!')
      }
    }
  }
})
