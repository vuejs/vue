> Live doc. Subject to change anytime before 0.11 release.

**Table of Contents**

- [Instantiation process](#instantiation-process)
- [New Scope Inheritance Model](#new-scope-inheritance-model)
- [Instance Option changes](#instance-option-changes)
- [Instance methods change](#instance-methods-change)
- [Computed Properties API Change](#computed-properties-api-change)
- [Directive API change](#directive-api-change)
- [Interpolation change](#interpolation-change)
- [Config API change](#config-api-change)
- [Transition API change](#transition-api-change)
- [Events API change](#events-api-change)
- [Two Way filters](#two-way-filters)
- [Block logic control](#block-logic-control)
- [Misc](#misc)

## Instantiation process

> Breaking

**If no `el` option is provided** at instantiation, Vue will no longer auto-create an empty div for you. In this case, the instance is considered to be in "unmounted" state. Data will be observed, but no DOM compilation will happen until the new instance method `$mount` has been explicitly called.

``` js
var vm = new Vue({ data: {a:1} }) // only observes the data
vm.$mount('#app') // actually compile the DOM

// in comparison, this will compile instantly just like before.
var vm = new Vue({ el: '#app', data: {a: 1} })
```

If `$mount()` is called with no argument, an empty `<div>` will then be created.

## New Scope Inheritance Model

> Breaking

In the previous version, nested Vue instances do not have prototypal inheritance of their data scope. Although you can access parent data properties in templates, you need to explicitly travel up the scope chain with `this.$parent` in JavaScript code or use `this.$get()` to get a property on the scope chain. The expression parser also needs to do a lot of dirty work to determine the correct scope the variables belong to.

In the new model, we provide a scope inheritance system similar to Angular, in which you can directly access properties that exist on parent scopes. The major difference is that setting a primitive value property on a child scope WILL affect that on the parent scope! Because all data properties in Vue are getter/setters, so setting a property with the same key as parent on a child will not cause the child scope to create a new property shadowing the parent one, but rather it will just invoke the parent's setter function. See the example [here](http://jsfiddle.net/Px2n6/2/).

The result of this model is a much cleaner expression evaluation implementation. All expressions can simply be evaluated against the vm.

By default, all child components **DO NOT** inherit the parent scope. Only anonymous instances created in `v-repeat` and `v-if` inherit parent scope by default. This avoids accidentally falling through to parent properties when you didn't mean to. If you want your component to explicitly inherit parent scope, use the `inherit:true` option.

## Instance Option changes

- #### `el` and `data` for component definitions

  > Breaking

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

  When events are used extensively for cross-vm communication, the ready hook can get kinda messy. The new `events` option is similar to its Backbone equivalent, where you can declaratiely register a bunch of event listeners. You can also use it to register hook listeners.

  ``` js
  var vm = new Vue({
    events: {
      'hook:created': function () {
        console.log('created!')
      },
      greeting: function (msg) {
        console.log(msg)
      },
      // can also use a string for methods
      bye: 'sayGoodbye'
    },
    methods: {
      sayGoodbye: function () {
        console.log('goodbye!')
      }
    }
  })
  // -> created!
  vm.$emit('greeting', 'hi!')
  // -> hi!
  vm.$emit('bye')
  // -> goodbye!
  ```

- #### new option: `inherit`.

  Default: `false`.

  Whether to inherit parent scope data. Set it to `true` if you want to create a component that inherits parent scope. By default, inside a component's template you won't be able to bind to data on parent scopes. When this is set to `true`, you will be able to:

  1. bind to parent scope properties in the component template
  2. directly access parent properties on the component instance itself, via prototypal inheritance.

- #### new option: `mixins`.

  The `mixins` option accepts an array of mixin objects. These mixin objects can contain instance options just like normal instance objects, and they will be merged against the eventual options using the same merge logic in `Vue.extend`. e.g. If your mixin contains a `created` hook and the component itself also has one, both functions will be called.

  ``` js
  var mixin = {
    created: function () { console.log(2) }
  }
  var vm = new Vue({
    created: function () { console.log(1) },
    mixins: [mixin]
  })
  // -> 1
  // -> 2
  ```

- #### new options: `name`.

  This option, when used with `Vue.extend`, gives your returned constructor a more descriptive name rather than the generic `VueComponent`. This makes debugging easier when you log instances in the console. For example:

  ``` js
  var SubClass = Vue.extend({
    name: 'MyComponent'
  })
  var instance = new SubClass()
  console.log(instance) // -> MyComponent { $el: ... }
  ```

  When you use `Vue.component`, the component ID is automatically camelized and used as the constructor name, so `"my-component"` will have a constructor name of `MyComponent`.

  This option is ignored as an instance option.

- #### removed options:

  > Breaking

  - `parent`

    This option has been removed. To create a child instance that inherits parent scope, use `var child = parent.$addChild(options, [contructor])`.

  - `lazy`

    The `lazy` option is removed because this does not belong at the vm level. Users should be able to configure individual `v-model` instances to be lazy or not.

  The following are also removed, use `el` with a function instead:

  - `id`
  - `tagName`
  - `className`
  - `attributes`

- #### hook changes

  > Breaking

  - #### hook usage change: `created`

    In the past, you could do `this.something = 1` inside the `created` hook to add observed data to the instance. Now the hook is called after the data observation, so if you wish to add additional data to the instance you should use the new `$add` and `$delete` API methods.

  - #### hook usage change: `ready`

    The new `ready` hook now is only fired after the instance is compiled and **inserted into the document for the first time**. For a equivalence of the old `ready` hook, use the new `compiled` hook.

  - #### new hook: `beforeCompile`

    This new hook is introduced to accompany the separation of instantiation and DOM mounting. It is called right before the DOM compilation starts and `this.$el` is available, so you can do some pre-processing on the element here.

  - #### new hook: `compiled`

    The `compiled` hook indicates the element has been fully compiled based on initial data. However this doesn't indicate if the element has been inserted into the DOM yet. This is essentially the old `ready` hook.

  - #### renamed hook: `afterDestroy` -> `destroyed`

## Instance methods change

- #### `vm.$watch`

  - **Expression watching**

    `vm.$watch` can now accept an expression:

    ``` js
    vm.$watch('a + b', function (newVal, oldVal) {
      // do something
    })
    ```

  - **Deep watching**

    (Breaking) A change from 0.11 is that `$watch` now by default only fires when the identity of the watched value changes. If you want the watcher to also fire the callback when a nested value changes, pass in the third optional `deep` argument:

    ``` js
    vm.$watch('someObject', callback, true)
    vm.someObject.nestedValue = 123
    // callback is fired
    ```

  - **Immediate invocation**

    By default the callback only fires when the value changes. If you want it to be called immediately with the initial value, use the fourth optional `immediate` argument:

    ``` js
    vm.$watch('a', callback, false, true)
    // callback is fired immediately with current value of `a`
    ```

  - **Unwatching**

    (Breaking) `$unwatch` has been removed. `$watch` now also returns an unregister function:

    ``` js
    var unwatch = vm.$watch('a', cb)
    // later, teardown the watcher
    unwatch()
    ```

- #### `vm.$get`

  `vm.$get` now accepts expressions:

  ``` js
  var value = vm.$get('a + b')
  ```

- #### New methods

  - `vm.$add` and `vm.$delete`

    Explicitly add/remove properties from the ViewModel. Observed objects are augmented with these two methods too. Use these only when needed - the best practice is to define all your data fields at instantiation, even with a `null` value.

  - `vm.$eval`

    Evaluate an expression that can also include filters.

    ``` js
    var value = vm.$eval('msg | uppercase')
    ```

  - `vm.$interpolate`

    Evalutate a piece of template string.

    ``` js
    var markup = vm.$interpolate('<p>{{msg | uppercase}}</p>')
    ```

  - `vm.$log`

    Log the current instance data as a plain object, which is more console-inspectable than a bunch of getter/setters. Also accepts an optional key.

    ``` js
    vm.$log() // logs entire ViewModel data
    vm.$log('item') // logs vm.item
    ```

## Computed Properties API Change

> Breaking

`$get` and `$set` is now simply `get` and `set`:

``` js
computed: {
  fullName: {
    get: function () {},
    set: function () {}
  }
}
```

## Directive API change

- #### Dynamic literals

  Literal directives can now also be dynamic via bindings like this:

  ``` html
  <div v-component="{{test}}"></div>
  ```

  When `test` changes, the component used will change! This essentially replaces the old `v-view` directive.

  When authoring literal directives, you can now provide an `update()` function if you wish to handle it dynamically. If no `update()` is provided the directive will be treated as a static literal and only evaluated once.

  Note that `v-component` is the only directive that supports this.

- #### Directive params

  Some built-in directives now checks for additional attribute params to trigger special behavior.

  - `v-model`

    `v-model` now will check `lazy` attribute for lazy model update, and will check `number` attribute to know if it needs to convert the value into Numbers before writing back to the model.

    When used on a `<select>` element, `v-model` will check for an `options` attribute, which should be an keypath/expression that points to an Array to use as its options. The Array can contain plain strings, or contain objects.

    The object can be in the format of `{text:'', value:''}`. This allows you to have the option text displayed differently from its underlying value:

    ``` js
    [
      { text: 'A', value: 'a' },
      { text: 'B', value: 'b' }
    ]
    ```

    Will render:

    ``` html
    <select>
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
    ```

    Alternatively, the object can be in the format of `{ label:'', options:[...] }`. In this case it will be rendered as an `<optgroup>`:

    ``` js
    [
      { label: 'A', options: ['a', 'b']},
      { label: 'B', options: ['c', 'd']}
    ]
    ```

    Will render:

    ``` html
    <select>
      <optgroup label="A">
        <option value="a">a</option>
        <option value="b">b</option>
      </optgroup>
      <optgroup label="B">
        <option value="c">c</option>
        <option value="d">d</option>
      </optgroup>
    </select>
    ```

  - `v-component`

    When used as a dynamic component, it will check for the `keep-alive` attribute. When `keep-alive` is present, already instantiated components will be cached. This is useful when you have large, nested view components and want to maintain the state when switching views.

  - `v-repeat`

    One of the questions I've asked about is how `v-repeat` does the array diffing and what happens if we swap the array with a fresh array grabbed from an API end point. In 0.10 because the objects are different, all instances have to been re-created. In 0.11 we introduce the `trackby` attribute param. If each of your data objects in the array has a unique id, we can use that id to reuse existing instances when the array is swapped.

    For example, if we have the data in the following format:

    ``` js
    items: [
      { _id: 1, ... },
      { _id: 2, ... },
      { _id: 3, ... }
    ]
    ```

    In your template you can do:

    ``` html
    <li v-repeat="items" trackby="_id">...</li>
    ```

    Later on when you swap `items` with a different array, even if the objects it contains are new, as long as they have the same trackby id we can still efficiently reuse existing instances.

- #### Usage change for `v-with`

  In 0.10 and earlier, `v-with` creates a two-way binding between the parent and child instance. In 0.11, it no longer creates a two-way binding but rather facilitates a unidirectional data flow from parent to child.

  For example:

  ``` html
  <div v-component="test" v-with="childKey:parentKey">{{childKey}}</div>
  ```

  Here when you do `this.a = 123` in the child, the child's view will update, but the parent's scope will remain unaffected. When `parent.parentKey` changes again, it will overwrite `child.childKey`.

- #### New directive: `v-el`

  Similar to `v-ref`, but instead stores a reference to a DOM Node in `vm.$$`. For the reasoning behind the addition see [this thread](https://github.com/yyx990803/vue/issues/404#issuecomment-53566116).

- #### New directive option: `twoWay`

  This option indicates the directive is two-way and may write back to the model. Allows the use of `this.set(value)` inside directive functions.

- #### Removed directive option: `isEmpty`

## Interpolation change

- (Breaking) Text bindings will no longer automatically stringify objects. Use the new `json` filter which gives more flexibility in formatting.

- #### One time interpolations

  ``` html
  <span>{{* hello }}</span>
  ```

  One time interpolations do not need to set up watchers and can improve initial rendering performance. If you know something's not going to change, make sure to use this new feature. Example:

## Config API change

> Breaking

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

- #### New config option: `proto`

  Be default, Vue.js alters the `__proto__` of observed Arrays when available for faster method interception/augmentation. This would only cause issue in the rare case when you are observing a subclass of the native Array. In that case, you can set `Vue.config.proto = false` to prohibit this behavior.

## Transition API Change

> Breaking

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
    beforeEnter: function (el) {
      // a synchronous function called right before the
      // element is inserted into the document.
      // you can do some pre-styling here to avoid FOC.
    },
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

## Events API change

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

## Misc

- `$destroy()` now by default leaves `$el` intact. If you want to remove it (and trigger transitions), call `$destroy(true)`.

- When there are inline values on input elements bound with `v-model`, e.g. `<input value="hi" v-model="msg">`, the **inline value** will be used as the inital value. If the vm comes with default data, it **will be overwritten** by the inline value. Same for `selected` attribute on `<option>` elements.
