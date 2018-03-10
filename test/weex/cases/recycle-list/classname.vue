<template>
  <recycle-list for="item in longList" switch="type">
    <cell-slot case="A" class="cell">
      <text :class="['text', item.color]">content</text>
    </cell-slot>
  </recycle-list>
</template>

<style scoped>
.cell {
  background-color: #ff6600;
}
.text {
  font-size: 100px;
  text-align: center;
}
.red {
  color: #ff0000;
}
.blue {
  color: #0000ff;
}
</style>

<script>
module.exports = {
  data() {
    return {
      longList: [{ type: 'A', color: 'red' }, { type: 'A', color: 'blue' }]
    }
  }
}
</script>
