import Vue from '../../../dist/vue.common.js';

export default Vue.extend({
  props: ['currentBranch', 'branches', 'apiUrl', 'commits'],

  template: `
    <div>
      <h1>Latest Vue.js Commits</h1>
      <template v-for="branch in branches">
        <input type="radio"
          :id="branch"
          :value="branch"
          name="branch"
          v-model="currentBranch">
        <label :for="branch">{{ branch }}</label>
      </template>
      <p>vuejs/vue@{{ currentBranch }}</p>
      <ul>
        <li v-for="record in commits">
          <a :href="record.html_url" target="_blank" class="commit">{{ record.sha.slice(0, 7) }}</a>
          - <span class="message">{{ record.commit.message | truncate }}</span><br>
          by <span class="author"><a :href="record.author.html_url" target="_blank">{{ record.commit.author.name }}</a></span>
          at <span class="date">{{ record.commit.author.date | formatDate }}</span>
        </li>
      </ul>
    </div>
  `,

  watch: {
    currentBranch: 'fetchData'
  },

  filters: {
    truncate (v) {
      const newline = v.indexOf('\n');
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDate (v) {
      return v.replace(/T|Z/g, ' ');
    }
  },

  methods: {
    fetchData () {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}${this.currentBranch}`)
      window.history.pushState(null, null, `/${this.currentBranch}`);
      xhr.onload = () => this.commits = JSON.parse(xhr.responseText);
      xhr.send();
    }
  }
});
