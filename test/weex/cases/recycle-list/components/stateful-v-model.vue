<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <editor message="No binding"></editor>
    </cell-slot>
  </recycle-list>
</template>

<script>
  // require('./editor.vue')
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
