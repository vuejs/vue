> Live doc. Subject to change anytime before 0.11 release.

**Table of Contents**

- [Instantiation](#instantiation)
- [New Scope Inheritance Model](#new-scope-inheritance-model)
- [Option changes](#option-changes)
- [Hook changes](#hook-changes)
- [Computed Properties](#computed-properties)
- [Directive changes](#directive-changes)
- [Interpolation changes](#interpolation-changes)
- [Two Way filters](#two-way-filters)
- [Block logic control](#block-logic-control)
- [Config API change](#config-api-change)
- [One time interpolations](#one-time-interpolations)
- [`$watch` API change](#$watch-api-change)
- [Simplified Transition API](#simplified-transition-api)
- [Events API](#events-api)

## Instantiation

**If no `el` option is provided** at instantiation, Vue will no longer auto-create an empty div for you. In this case, the instance is considered to be in "unmounted" state. Data will be observed, but no DOM compilation will happen until the new instance method `$mount` has been explicitly called.

``` js
var vm = new Vue({ data: {a:1} }) // only observes the data
vm.$mount('#app') // actually compile the DOM

// in comparison, this will compile instantly just like before.
var vm = new Vue({ el: '#app', data: {a: 1} })
```

## New Scope Inheritance Model

In the previous version, nested Vue instances do not have prototypal inheritance of their data scope. Although you can access parent data properties in templates, you need to explicitly travel up the scope chain with `this.$parent` in JavaScript code or use `this.$get()` to get a property on the scope chain. The expression parser also needs to do a lot of dirty work to determine the correct scope the variables belong to.

In the new model, we provide a scope inehritance system similar to Angular, in which you can directly access properties that exist on parent scopes. The major difference is that setting a primitive value property on a child scope WILL affect that on the parent scope! This is one of the major gotchas in Angular. If you are somewhat familiar with how prototype inehritance works, you might be surprised how this is possible. Well, the reason is that all data properties in Vue are getter/setters, and invoking a setter will not cause the child scope shadowing parent scopes. See the example [here](http://jsfiddle.net/yyx990803/Px2n6/).

The result of this model is a much cleaner expression evaluation implementation. All expressions can simply be evaluated against the vm.

You can also pass in `isolated: true` to avoid inheriting a parent scope, which can provide encapsulation for reusable components and improve performance.

## Option changes

- #### `el` and `data` for component definitions

  When used in component definitions and in `Vue.extend()`, the `el`, and `data` options now only accept a function that returns the per-instance value. For example:

  ``` js
var MyComponent = Vue.extend({
  el: function () {
    var el = document.createElement('p')
    // you can initialize your element here.
    // you can even return a documentFragment to create
    // a block instance.
    el.className = 'content'
    return el
  },
  data: function () {
    // similar to ReactComponent.getInitialState
    return {
      a: {
        b: 123
      }
    }
  }
})
  ```

- #### new option: `events`.

  When events are used extensively for cross-vm communication, the ready hook can get kinda messy. The new `events` option is similar to its Backbone equivalent, where you can declaratiely register a bunch of event listeners.

- #### new option: `isolated`.

  Default: `false`.

  Whether to inherit parent scope data. Set it to `true` if you want to create a component that have an isolated scope of its own. An isolated scope means you won't be able to bind to data on parent scopes in the component's template.

- #### removed options:

  - `parent`

    This option has been removed. To create a child instance that inherits parent scope, use `var child = parent.$addChild(options, [contructor])`.

  - `lazy`

    The `lazy` option is removed because this does not belong at the vm level. Users should be able to configure individual `v-model` instances to be lazy or not.

  The following are also removed, use `el` with a function instead:

  - `id`
  - `tagName`
  - `className`
  - `attributes`

## Hook changes

- #### hook usage change: `created`

  This is now called before anything happens to the instance, with only `this.$data` being available, but **not observed** yet. In the past you can do `this.something = 1` to define default data, but it required some weird hack to make it work. Now you should just explicitly do `this.$data.something = 1` to define your instance default data.

- #### hook usage change: `ready`

  The new `ready` hook now is only fired after the instance is compiled and **inserted into the document for the first time**. For a equivalence of the old `ready` hook, use the new `compiled` hook.

- #### new hook: `beforeCompile`

  This new hook is introduced to accompany the separation of instantiation and DOM mounting. It is called right before the DOM compilation starts and `this.$el` is available, so you can do some pre-processing on the element here.

- #### new hook: `compiled`

  The `compiled` hook indicates the element has been fully compiled based on initial data. However this doesn't indicate if the element has been inserted into the DOM yet. This is essentially the old `ready` hook.

- #### renamed hook: `afterDestroy` -> `destroyed`

## Computed Properties

`$get` and `$set` is now simply `get` and `set`:

``` js
computed: {
  fullName: {
    get: function () {},
    set: function () {}
  }
}
```

## Directive changes

- #### Dynamic literals

  Literal directives can now also be dynamic via bindings like this:

  ``` html
<div v-component="{{test}}"></div>
  ```

  When `test` changes, the component used will change! This essentially replaces the old `v-view` directive.

  When authoring literal directives, you can now provide an `update()` function if you wish to handle it dynamically. If no `update()` is provided the directive will be treated as a static literal and only evaluated once.

- #### New directive option: `twoWay`

  This option indicates the directive is two-way and may write back to the model. Allows the use of `this.set(value)` inside directive functions.

- #### Removed directive option: `isEmpty`

## Interpolation changes

- Text bindings will no longer automatically stringify objects. Use the new `json` filter which gives more flexibility in formatting.

- **New feature**: One time interpolations. They do not need to set up watchers and can improve initial rendering performance. If you know something's not going to change, make sure to use this new feature. Example:

  ``` html
<span>{{* hello }}</span>
  ```

## Two Way filters

If a filter is defined as a function, it is treated as a read filter by default - i.e. it is applied when data is read from the model and applied to the DOM. You can now specify write filters as well, which are applied when writing to the model, triggered by user input. Write filters are only triggered on two-way bindings like `v-model`.

``` js
Vue.filter('format', {
  read: function (val) {
    return val + '!'
  },
  write: function (val, oldVal) {
    return val.match(/ok/) ? val : oldVal
  }
})
```

## Block logic control

One limitation of flow control direcitves like `v-repeat` and `v-if` is that they can only be used on a single element. Now you can use them to manage a block of content by using them on a `<template>` element that wraps the content you want managed:

``` js
items: [
  {
    title: 'title-1',
    subtitle: 'subtitle-1',
    content: 'content-1'
  },
  {
    title: 'title-2',
    subtitle: 'subtitle-2',
    content: 'content-2'
  }
]
```

``` html
<template v-repeat="item:items">
  <h2>{{item.title}}</h2>
  <p>{{item.subtitle}}</p>
  <p>{{item.content}}</p>
</template>
```

Rendered result:

``` html
<!--v-block-start-->
<h2>title-1</h2>
<p>subtitle-1</p>
<p>content-1</p>
<!--v-block-end-->
<!--v-block-start-->
<h2>title-2</h2>
<p>subtitle-2</p>
<p>content-2</p>
<!--v-block-end-->
```

## Config API change

Instead of the old `Vue.config()` with a heavily overloaded API, the config object is now available globally as `Vue.config`, and you can simply change its properties:

``` js
// old
// Vue.config('debug', true)

// new
Vue.config.debug = true
```

- #### `config.prefix` change

  Config prefix now should include the hyphen: so the default is now `v-` and if you want to change it make sure to include the hyphen as well. e.g. `Vue.config.prefix = "data-"`.

- #### `config.delimiters` change

  In the old version the interpolation delimiters are limited to the same base character (i.e. `['{','}']` translates into `{{}}` for text and `{{{}}}` for HTML). Now you can set them to whatever you like (*almost), and to indicate HTML interpolation, simply wrap the tag with one extra outer most character on each end. Example:

  ``` js
  Vue.config.delimiters = ['(%', '%)']
  // tags now are (% %) for text
  // and ((% %)) for HTML
  ```

  * Note you still cannot use `<` or `>` in delimiters because Vue uses DOM-based templating.

## `$watch` API change

`vm.$watch` can now accept an expression:

``` js
vm.$watch('a + b', function (newVal, oldVal) {
  // do something
})
```

By default the callback only fires when the value changes. If you want it to be called immediately with the initial value, use the third optional `immediate` argument:

``` js
vm.$watch('a', callback, true)
// callback is fired immediately with current value of `a`
```

`$watch` now also returns an unregister function (`$unwatch` has been removed):

``` js
var unwatch = vm.$watch('a', cb)
// later, teardown the watcher
unwatch()
```

## Simplified Transition API

- no more distinctions between `v-transition`, `v-animation` or `v-effect`;
- no more configuring enter/leave classes in `Vue.config`;
- `Vue.effect` has been replaced with `Vue.transition`, the `effects` option has also been replaced by `transitions`.

With `v-transition="my-transition"`, Vue will:

1. Try to find a transition definition object registered either through `Vue.transition(id, def)` or passed in with the `transitions` option, with the id `"my-transition"`. If it finds it, it will use that definition object to perform the custom JavaScript based transition.

2. If no custom JavaScript transition is found, it will automatically sniff whether the target element has CSS transitions or CSS animations applied, and add/remove the classes as before.

3. If no transitions/animations are detected, the DOM manipulation is executed immediately instead of hung up waiting for an event.

- #### JavaScript transitions API change

  Now more similar to Angular:

  ``` js
Vue.transition('fade', {
  enter: function (el, done) {
    // element is already inserted into the DOM
    // call done when animation finishes.
    $(el)
      .css('opacity', 0)
      .animate({ opacity: 1 }, 1000, done)
    // optionally return a "cancel" function
    // to clean up if the animation is cancelled
    return function () {
      $(el).stop()
    }
  },
  leave: function (el, done) {
    // same as enter
    $(el)
      .animate({ opacity: 0 }, 1000, done)
    return function () {
      $(el).stop()
    }
  }
})
  ```

## Events API

Now if an event handler return `false`, it will stop event propagation for `$dispatch` and stop broadcasting to children for `$broadcast`.

``` js
var a = new Vue()
var b = new Vue({
  parent: a
})
var c = new Vue({
  parent: b
})

a.$on('test', function () {
  console.log('a')
})
b.$on('test', function () {
  console.log('b')
  return false
})
c.$on('test', function () {
  console.log('c')
})
c.$dispatch('test')
// -> 'c'
// -> 'b'
```