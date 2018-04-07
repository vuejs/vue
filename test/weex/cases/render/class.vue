<template>
  <div>
    <div :class="class1"></div>
    <div :class="class2"></div>
    <div class="box" :class="class3"></div>
    <div class="box" :class="class4"></div>
    <div class="box" :class="{ box5: class5 }"></div>
  </div>
</template>

<style scoped>
  .box {
    width: 100px;
    height: 100px;
  }

  .box1 {
    background-color: #DDD;
  }

  .box2 {
    background-color: #CCC;
  }

  .box3 {
    background-color: #BBB;
  }

  .box4 {
    background-color: #AAA;
  }

  .box5 {
    background-color: #999;
  }
</style>

<script>
  module.exports = {
    data () {
      return {
        class1: ['box', 'box1'],
        class2: {
          'box': true,
          'box1': false,
          'box2': true
        },
        class3: ['box3'],
        class4: {
          'box4': true
        },
        class5: true
      }
    }
  }
</script>