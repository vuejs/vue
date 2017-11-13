<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <image v-if="item.sourceA" :src="item.sourceA"></image>
      <image v-else-if="item.sourceB" :src="item.sourceB"></image>
      <image v-else :src="item.placeholder"></image>
    </cell-slot>
  </recycle-list>
</template>

<script>
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

