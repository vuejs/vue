<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <banner></banner>
      <text>content</text>
    </cell-slot>
  </recycle-list>
</template>

<script>
  // require('./banner.vue')
  module.exports = {
    data () {
      return {
        longList: [
          { type: 'A' },
          { type: 'A' }
        ]
      }
    }
  }
</script>
