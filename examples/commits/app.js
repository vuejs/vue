/* global Vue */

const apiURL = "https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha=";

/**
 * Actual demo
 */

new Vue({
  el: "#demo",

  data: {
    branches: ["master", "dev"],
    currentBranch: "master",
    commits: null,
  },

  created: function () {
    this.fetchData();
  },

  watch: {
    currentBranch: "fetchData",
  },

  filters: {
    truncate: function (v) {
      const newline = v.indexOf("\n");
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDate: function (v) {
      return v.replace(/T|Z/g, " ");
    },
  },

  methods: {
    fetchData: function () {
      const self = this;
      if (navigator.userAgent.indexOf("PhantomJS") > -1) {
        // use mocks in e2e to avoid dependency on network / authentication
        setTimeout(function () {
          self.commits = window.MOCKS[self.currentBranch];
        }, 0);
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", apiURL + self.currentBranch);
        xhr.onload = function () {
          self.commits = JSON.parse(xhr.responseText);
          console.log(self.commits[0].html_url);
        };
        xhr.send();
      }
    },
  },
});
