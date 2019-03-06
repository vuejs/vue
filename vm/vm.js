const strategies = Vue.config.optionMergeStrategies;
const mergeCreatedStrategy = strategies.created;
strategies.created = function strategy(...args) {
  console.log(args[2]); // <-- undefined when creating the component
  return mergeCreatedStrategy(...args);
};

Vue.component("test", {
  template: "<p>Child</p>",
  created() {
    console.log('Created child');
  },
});

new Vue({
  el: '#app',
  created() {
    console.log('Created app');
  },
});
