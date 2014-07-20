If you happen to see this - note that most of these are just planned but subject to change at any moment. Feedback is welcome though.

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

The result of this model is a much cleaner expression evaluation implementation. All expressions can simply be evaluated with the vm's `$scope` as the `this` context.

This is very useful, but it probably should only be available in implicit child instances created by flow-control directives like `v-repeat`, `v-if`, etc. Explicit components should retain its own root scope and use some sort of two way binding like `v-with` to bind to data from outer scope.

- new option: `syncData`.

A side effect of the new scope/data model is that the `data` object being passed in is no longer mutated by default, because all its properties are copied into the scope instead. To sync changes to the scope back to the original data object, you need to now explicitly pass in  `syncData: true` in the options. In most cases, this is not necessary, but you do need to be aware of this.

## Two Way filters

``` html
  <input v-model="abc | email">
```

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

``` html
<!-- v-repeat="list" -->
  <h2>{{title}}</h2>
  <p>{{content}}</p>
<!-- v-repeat-end -->
```

``` html
<!-- v-if="showProfile" -->
  <my-avatar></my-avatar>
  <my-bio></my-bio>
<!-- v-if-end -->
```

## (Experimental) More flexible directive syntax
  
  - v-on

    ``` html
    <a v-on="{click: onClick, dragmove: onMove}"></a>
    ```

  - v-style

    ``` html
    <a v-style="{top: list + ‘px’}"></a>
    ```

  - custom directive

    ``` html
    <a v-my-table="{ data:hello, rows:5, cols:10 }">fsef</a>
    ```

  - v-with

    ``` html
    <div v-component="my-comp" v-with="{
      id: id,
      name: name
    }">
    ```

  - v-repeat

    ``` html
    <ul>
      <li v-repeat="{
        data     : list,
        as       : 'item',
        filterBy : filterKey,
        orderBy  : orderKey
      }"></li>
    </ul>
    ```

## (Experimental) Validators

``` html
  <input v-model="abc @ email">
```

``` js
  Vue.validator('email', function (val) {
    return val.match(...)
  })
  // this.$validation.abc // false
  // this.$valid // false
```

## (Experimental) One time interpolations

``` html
<span>{{* hello }}</span>
```