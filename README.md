# VueJS [![Build Status](https://travis-ci.org/yyx990803/vue.png?branch=master)](https://travis-ci.org/yyx990803/vue)

> Lightweight, Simple, Fast & Composable MVVM library for building interactive user interfaces.

## Introduction

VueJS is a library for building interactive interfaces. It provides the **ViewModel** layer of the MVVM pattern, which connects the **View** (the actual HTML that the user sees) and the **Model** (JSON-compliant plain JavaScript objects) via two way data-bindings. [Read more.](https://github.com/yyx990803/vue/wiki/What-is-VueJS)

## Browser Support

- Most Webkit/Blink-based browsers
- Firefox 4+
- IE9+ (IE9 needs [classList polyfill](https://github.com/remy/polyfills/blob/master/classList.js) and doesn't support transitions)

## Documentation

Please see the [Wiki](https://github.com/yyx990803/vue/wiki). (under construction)

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

To test (install [CasperJS](http://casperjs.org/) first):

``` bash
$ grunt test
```

## License

MIT