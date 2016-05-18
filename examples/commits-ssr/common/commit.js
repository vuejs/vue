import Vue from '../../../dist/vue.common.js';

export default Vue.extend({
  props: ['commit'],

  template: `
    <li class="commit">
      <a :href="commit.html_url" target="_blank" class="commit">{{ commit.sha.slice(0, 7) }}</a>
      - <span class="message">{{ commit.commit.message | truncate }}</span><br>
      by <span class="author"><a :href="commit.author.html_url" target="_blank">{{ commit.commit.author.name }}</a></span>
      at <span class="date">{{ commit.commit.author.date | formatDate }}</span>
    </li>
  `,

  filters: {
    truncate (v) {
      const newline = v.indexOf('\n');
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDate (v) {
      return v.replace(/T|Z/g, ' ');
    }
  }
});
