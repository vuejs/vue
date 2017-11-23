<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <poster :image-url="item.poster" :title="item.title"></poster>
      <text>content</text>
    </cell-slot>
  </recycle-list>
</template>

<script>
  // require('./poster.vue')
  module.exports = {
    data () {
      return {
        longList: [
          { type: 'A', poster: 'xx', title: 'x' },
          { type: 'A', poster: 'yy', title: 'y' }
        ]
      }
    }
  }
</script>
