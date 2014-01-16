<p align="center"><a href="http://vuejs.org" target="_blank"><img width="100"src="http://vuejs.org/images/logo.png"></a></p>

# Vue.js [![Build Status](https://travis-ci.org/yyx990803/vue.png?branch=master)](https://travis-ci.org/yyx990803/vue) [![Selenium Test Status](https://saucelabs.com/buildstatus/vuejs)](https://saucelabs.com/u/vuejs) [![Coverage Status](https://coveralls.io/repos/yyx990803/vue/badge.png)](https://coveralls.io/r/yyx990803/vue)

> Simple, Fast & Composable MVVM for building interative interfaces.

## Introduction

Vue.js is a library that aims to simplify the development of interactive interfaces.

It provides the **ViewModel** layer of the MVVM pattern, which connects the **View** (the actual HTML that the user sees) and the **Model** (JSON-compliant plain JavaScript objects) via two-way data bindings. Actuall DOM manipulations and output formatting are abstracted away into **Directives** and **Filters**.

For more details, guides and documentations, visit [vuejs.org](http://vuejs.org).

## Browser Support

Vue.js supports [most ECMAScript 5 compliant browsers](https://saucelabs.com/u/vuejs), essentially IE9+. IE9 needs [classList polyfill](https://github.com/remy/polyfills/blob/master/classList.js) and doesn't support transitions.

## Development

``` bash
# in case you don't already have them:
# npm install -g grunt-cli component
$ npm install
$ component install
```

To build:

``` bash
$ grunt build
```

To watch and auto-build dev version during development:

``` bash
$ grunt watch
```

To test:

``` bash
# if you don't have these yet:
# npm install -g phantomjs casperjs
$ grunt test
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Evan You