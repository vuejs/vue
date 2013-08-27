# Seed (WIP)
## a mini MVVM framework

- 8kb gzipped, no dependency.
- DOM based templates with precise and efficient manipulation
- POJSO (Plain Old JavaScript Objects) Models FTW - even nested objects.
- Auto dependency extraction for computed properties.
- Auto event delegation on repeated items.
- Flexible API.
- [Component](https://github.com/component/component) based, but can also be used with [Browserify](https://github.com/substack/node-browserify), as a CommonJS/AMD module or as a standalone library.

### Browser Support

- Chrome 8+
- Firefix 3.6+
- Safari 5.1+
- IE9+ (IE9 needs [classList polyfill](https://github.com/remy/polyfills/blob/master/classList.js))
- Opera 11.6+
- Android browser 3.0+
- iOS Safari 5.0+

### Installation

- Component:  
    ``` bash
    $ component install yyx990803/seed
    ```

- Browserify:
    ``` bash
    $ npm install seed-mvvm
    ```

- Using Module Loaders:

    Built versions in `/dist` can be used directly as a CommonJS or AMD module.

- Standalone:

    Loading a built version in `/dist` via a script tag will register `seed` as a global variable.

### [ Docs under construction... ]

Simplest possible example:

HTML

``` html
<div id="demo">
    <p sd-text="hello"></p>
</div>
```

JavaScript

``` js
new seed.ViewModel({
    el: '#demo',
    data: {
        hello: 'Hello World!'
    }
})
```