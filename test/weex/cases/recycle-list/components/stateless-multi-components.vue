<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <banner></banner>
      <text>----</text>
      <footer></footer>
    </cell-slot>
    <cell-slot template-type="B">
      <banner></banner>
      <poster :image-url="item.poster" :title="item.title"></poster>
    </cell-slot>
  </recycle-list>
</template>

<script>
  // require('./banner.vue')
  // require('./footer.vue')
  // require('./poster.vue')
  module.exports = {
    data () {
      return {
        longList: [
          { type: 'A' },
          { type: 'B', poster: 'yy', title: 'y' },
          { type: 'A' }
        ]
      }
    }
  }
</script>
