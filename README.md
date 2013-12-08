# VueJS

Data-driven, modular & lightweight ViewModels

[![Build Status](https://travis-ci.org/yyx990803/vue.png?branch=master)](https://travis-ci.org/yyx990803/vue)

## Features

- 10kb gzipped, no dependency.
- DOM based templates with two-way data binding.
- Precise and efficient DOM manipulation with granularity down to a TextNode.
- POJSO (Plain Old JavaScript Objects) Models that can be shared across ViewModels with arbitrary levels of nesting.
- Extendable with custom directives and filters.
- Auto dependency extraction for computed properties.
- Auto event delegation on repeated items.
- Flexible API that allows easy encapsulation of components.
- Supports partials, transitions and nested view models.
- Plays well with module systems. Primarily [Component](https://github.com/component/component) based, but can also be used with [Browserify](https://github.com/substack/node-browserify), as a CommonJS/AMD module or as a standalone library.

## Browser Support

- Most Webkit/Blink-based browsers
- Firefox 4+
- IE9+ (IE9 needs [classList polyfill](https://github.com/remy/polyfills/blob/master/classList.js) and doesn't support transitions)

## Installation

**Component**

    $ component install yyx990803/vue

**Browserify**

    $ npm install vue

**Bower**

    $ bower install vue

**Module Loaders, e.g. RequireJS, SeaJS**

Built versions in `/dist` or installed via Bower can be used directly as a CommonJS or AMD module.

**Standalone**

Simply include a built version in `/dist` or installed via Bower with a script tag. `Vue` will be registered as a global variable.

## Development

``` bash
# in case you don't already have them:
# npm install -g grunt-cli component
$ npm install
$ component install
```

To build:
``` bash
$ grunt componentbuild
```

To watch and auto-build dev version during development:
``` bash
$ grunt watch
```

To test (install [CasperJS](http://casperjs.org/) first):
``` bash
$ grunt test
```

## Quickstart

**HTML**

~~~ html
<div id="demo" v-on="click:changeText">
    <p v-text="hello"></p>
</div>
~~~

**JavaScript**

~~~ js
new Vue({
    el: '#demo',
    scope: {
        hello: 'Hello World!',
        changeText: function () {
            this.hello = 'Hello VueJS!'
        }
    }
})
~~~

## Documentation

Coming soon...

## License

MIT