<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="X">
      <lifecycle></lifecycle>
    </cell-slot>
  </recycle-list>
</template>

<script>
  // require('./lifecycle.vue')
  module.exports = {
    data () {
      return {
        longList: [
          { type: 'X' },
          { type: 'X' }
        ]
      }
    }
  }
</script>
