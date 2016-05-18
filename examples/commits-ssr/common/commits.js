import Vue from '../../../dist/vue.common.js';

export default Vue.extend({
  props: ['currentBranch', 'apiUrl', 'commits'],

  template: `
    <ul>
      <commit v-for="commit in commits" :commit="commit"></commit>
    </ul>
  `,

  watch: {
    currentBranch: 'fetchData'
  },

  methods: {
    fetchData () {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}${this.currentBranch}`)
      window.history.pushState(null, null, `/${this.currentBranch}`);
      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        const errorMessage = response.message;
        const commits = errorMessage ? [] : response;
        this.commits = commits;
        this.errorMessage = errorMessage;
      };
      xhr.send();
    }
  }
});
