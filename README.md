# Seed.js

Modern, lightweight JavaScript MVVM

## Features

- 10kb gzipped, no dependency.
- DOM based templates with two-way data binding.
- Precise and efficient DOM manipulation with granularity down to a TextNode.
- POJSO (Plain Old JavaScript Objects) Models that can be shared across ViewModels with arbitrary levels of nesting.
- Auto dependency extraction for computed properties.
- Auto event delegation on repeated items.
- Flexible API that allows easy encapsulation of components.
- Supports partials, transitions and nested ViewModels.
- Plays well with module systems. Primarily [Component](https://github.com/component/component) based, but can also be used with [Browserify](https://github.com/substack/node-browserify), as a CommonJS/AMD module or as a standalone library.

## Browser Support

- Most Webkit/Blink-based browsers
- Firefox 4+
- IE9+ (IE9 needs [classList polyfill](https://github.com/remy/polyfills/blob/master/classList.js) and doesn't support transitions)

## Installation

**Component**

    $ component install yyx990803/seed

**Browserify**

    $ npm install yyx990803/seed

**Bower**

    $ bower install seed

**Module Loaders, e.g. RequireJS, SeaJS**

Built versions in `/dist` or installed via Bower can be used directly as a CommonJS or AMD module.

**Standalone**

Simply include a built version in `/dist` or installed via Bower with a script tag. `seed` will be registered as a global variable.

## Development

Make sure you have `grunt-cli` installed globally. Then clone the repo and install dependencies:

    $ npm install

To watch and auto-build dev version during development:

    $ grunt watch

To test (install [CasperJS](http://casperjs.org/) first):

    $ grunt test

To build:

    $ grunt

## Quickstart

**HTML**

~~~ html
<div id="demo" sd-on="click:changeText">
    <p sd-text="hello"></p>
</div>
~~~

**JavaScript**

~~~ js
new Seed({
    el: '#demo',
    scope: {
        hello: 'Hello World!',
        changeText: function () {
            this.hello = 'Hello Seed!'
        }
    }
})
~~~

## Documentation

Coming soon...

## License

MIT