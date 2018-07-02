<template>
  <div class="wallet">
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import nemWrapper from '../ts/nemWrapper'
import walletModel from '../ts/walletModel'

@Component({
  name: 'wallet',
  props: {
    message: {
      type: String,
      default: 'default'
    }
  }
})
export default class Wallet extends Vue {
  title = 'wallet class'
  wallet = new walletModel()
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
