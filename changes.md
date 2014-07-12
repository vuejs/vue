# More flexible directive syntax
  
  - v-on
    <a v-on=”{click: onClick, dragmove: onMove}”></a>

  - v-style
    <a v-style=”{top: list + ‘px’}”></a>

  - custom directive
    <a v-table=”{ data:hello, rows:5, cols:10 }”>fsef</a>

  - v-repeat
    <ul>
      <li v-repeat="{
        data     : list,
        as       : 'item',
        filterBy : filterKey,
        orderBy  : orderKey
      }"></li>
    </ul>

# Two Way filters

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

# (Experimental) Validators

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