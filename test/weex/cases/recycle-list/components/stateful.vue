<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <counter :start="item.number"></counter>
      <text>other</text>
    </cell-slot>
  </recycle-list>
</template>

<script>
  // require('./counter.vue')
  module.exports = {
    data () {
      return {
        longList: [
          { type: 'A', number: 24 },
          { type: 'A', number: 42 }
        ]
      }
    }
  }
</script>
