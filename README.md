<p align="center"><a href="http://vuejs.org" target="_blank"><img width="100"src="http://vuejs.org/images/logo.png"></a></p>

# Vue.js [![Build Status](https://travis-ci.org/yyx990803/vue.svg?branch=master)](https://travis-ci.org/yyx990803/vue) [![Selenium Test Status](https://saucelabs.com/buildstatus/vuejs)](https://saucelabs.com/u/vuejs) [![Coverage Status](https://img.shields.io/coveralls/yyx990803/vue.svg)](https://coveralls.io/r/yyx990803/vue?branch=master)

> MVVM made simple.

## Introduction

Vue.js is a library for building interactive web interfaces. It provides the benefits of MVVM data binding and a composable component system with a simple and flexible API. You should try it out if you like:

- Intuitive API that simply makes sense
- Extendable Data bindings
- Plain JavaScript objects as models
- Building interface by composing reusable components
- Flexibility to mix & match the view layer with other libraries

It's really really easy to get started. Seriously, it's so easy:

``` html
<div id="demo">
  {{message}}
  <input v-model="message">
</div>
```

``` js
var demo = new Vue({
  el: '#demo',
  data: {
    message: 'Hello Vue.js!'
  }
})
```

To check out the live demo, guides and API reference, visit [vuejs.org](http://vuejs.org).

## Browser Support

Vue.js supports [most ECMAScript 5 compliant browsers](https://saucelabs.com/u/vuejs), essentially IE9+. IE8 and below are not supported.

## Contribution

Read the [contributing guide](https://github.com/yyx990803/vue/blob/master/CONTRIBUTING.md).

## Get in Touch

- For latest releases and announcements, follow on Twitter: [@vuejs](https://twitter.com/vuejs)
- Live discussion: [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/yyx990803/vue)
- Bugs reports: first read the [issue checklist](https://github.com/yyx990803/vue/blob/master/CONTRIBUTING.md#issue-reporting-checklist), then [open an issue](https://github.com/yyx990803/vue/issues).
- Questions, suggestions, feature requests: open an issue at [vuejs/Discussion](https://github.com/vuejs/Discussion/issues).
- If you have a Vue-related project/component/tool, add it to [this list](https://github.com/yyx990803/vue/wiki/User-Contributed-Components-&-Tools)!

## Changelog

Details changes for each release are documented in the [release notes](https://github.com/yyx990803/vue/releases).

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Evan You