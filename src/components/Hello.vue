<template>
  <div class="hello">
    <h1>{{ title }}</h1>
    <div v-html="message"> </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'hello',
  // propsは他のvueから値渡しする場合に使用する.
  props: {
    message: {
      type: String,
      default: 'default'
    }
  }
})
export default class Hello extends Vue {
  private title = 'Hello class'
  mounted () {
    console.log('mounted Hello')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #35495E;
}
</style>
