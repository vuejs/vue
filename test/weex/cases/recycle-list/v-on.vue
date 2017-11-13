<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <text v-on:click="handler" @longpress="move">A</text>
      <text @touchend="move">B</text>
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
      handler () {},
      move () {}
    }
  }
</script>

