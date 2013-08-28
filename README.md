# Seed.js

Mini MVVM framework

[ **BETA - tests not complete** ]

## Features

- 8kb gzipped, no dependency.
- DOM based templates with auto data binding.
- Precise and efficient DOM manipulation with granularity down to a TextNode.
- POJSO (Plain Old JavaScript Objects) Models that can be shared across ViewModels with arbitrary levels of nesting.
- Auto dependency extraction for computed properties.
- Auto event delegation on repeated items.
- Flexible API: Angular-style or Backbone-style, it's up to you.
- [Component](https://github.com/component/component) based, but can also be used with [Browserify](https://github.com/substack/node-browserify), as a CommonJS/AMD module or as a standalone library.

## Browser Support

- Chrome 8+
- Firefix 3.6+
- Safari 5.1+
- IE9+ (IE9 needs [classList polyfill](https://github.com/remy/polyfills/blob/master/classList.js))
- Opera 11.6+
- Android browser 3.0+
- iOS Safari 5.0+

## Installation

**Component**

    $ component install yyx990803/seed

**Browserify**

    $ npm install seed-mvvm

**Bower**

    $ bower install seed

**Module Loaders, e.g. RequireJS, SeaJS**

Built versions in `/dist` or installed via Bower can be used directly as a CommonJS or AMD module.

**Standalone**

Simply include a built version in `/dist` or installed via Bower with a script tag. `seed` will be registered as a global variable. You can also use it directly over [Browserify CDN](http://wzrd.in) at [http://wzrd.in/standalone/seed-mvvm](http://wzrd.in/standalone/seed-mvvm)

## [ Docs under construction... ]

Simplest possible example:

**HTML**

~~~ html
<div id="demo">
    <p sd-text="hello"></p>
</div>
~~~

**JavaScript**

~~~ js
new seed.ViewModel({
    el: '#demo',
    data: {
        hello: 'Hello World!'
    }
})
~~~