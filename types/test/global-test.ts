declare var Vue: vuejs.VueStatic;

var app = new Vue({
  data: {
    message: ""
  }
});

app.$mount("#app");

class Application extends Vue {}

Vue.component("component", {
  ready () {
    this.a
  }
} as vuejs.ComponentOption)
