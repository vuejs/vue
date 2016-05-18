import Vue from '../../dist/vue.js';
import App from './common/app.js';
import Commits from './common/commits.js';
import Commit from './common/commit.js';

Vue.component('commits', Commits.options);
Vue.component('commit', Commit.options);

new Vue(Object.assign(App, {
  el: '#app',
  data: window.__INITIAL_STATE__
}));
