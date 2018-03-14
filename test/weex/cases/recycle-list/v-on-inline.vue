<template>
  <recycle-list for="(item, i) in longList" switch="type">
    <cell-slot case="A">
      <text v-on:click="toggle()" @longpress="toggle(item.key)"></text>
      <text @appear="onappear(item.index, 'static', item.type, $event)">Button</text>
      <text @disappear="onappear(25, 'static')">Tips</text>
      <text @swipe="inc(i)">Inc</text>
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
    },
    methods: {
      inc () {},
      toggle () {},
      onappear () {}
    }
  }
</script>
