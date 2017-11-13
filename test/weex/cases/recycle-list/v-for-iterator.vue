<template>
  <recycle-list :list-data="longList" template-key="type" alias="item">
    <cell-slot template-type="A">
      <div v-for="(object, index) in item.list" :key="index">
        <text>{{object.name}}</text>
        <text v-for="(v, k, i) in object" :key="k">{{v}}</text>
      </div>
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

