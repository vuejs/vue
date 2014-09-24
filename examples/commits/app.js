var apiURL = 'https://api.github.com/repos/yyx990803/vue/commits?per_page=3&sha='

var demo = new Vue({

  el: '#demo',

  data: {
    branches: ['master', 'dev', 'next'],
    currentBranch: 'master',
    commits: null
  },

  created: function () {
    this.fetchData()
    this.$watch('currentBranch', function () {
      this.fetchData()
    })
  },

  filters: {
    truncate: function (v) {
      var newline = v.indexOf('\n')
      return newline > 0 ? v.slice(0, newline) : v
    },
    formatDate: function (v) {
      return v.replace(/T|Z/g, ' ')
    }
  },

  methods: {
    fetchData: function () {
      var xhr = new XMLHttpRequest()
      var self = this
      xhr.open('GET', apiURL + self.currentBranch)
      xhr.onload = function () {
        self.commits = JSON.parse(xhr.responseText)
      }
      xhr.send()
    }
  }
})