<template>
  <recycle-list for="item in list">
    <cell-slot>
      <text v-once>{{item.type}}</text>
    </cell-slot>
  </recycle-list>
</template>

<script>
  module.exports = {
    data () {
      return {
        list: [
          { type: 'A' },
          { type: 'A' }
        ]
      }
    }
  }
</script>

