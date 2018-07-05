<template>
  <v-app>
    <header>
      <span>{{ title }} </span>
    </header>
    <main>
      <!-- <Wallet/> -->
    </main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
// Walletをimportする.
import Wallet from './components/Wallet.vue'

// コンポーネントの設定
@Component({
  name: 'app',
  // Helloをcomponentとして定義する.
  components: {
    Wallet
  }
})

// クラス
export default class App extends Vue {
  
  // 変数( privateは書かなくても良い )
  private title = 'My NEM wallet'
  private message = ''

  // コンストラクタのようなもの。開くと初めに呼ばれる
  mounted () {
    // ログ出力 Chromeブラウザのconsoleで確認できる
    console.log('mounted App')
    // 関数呼び出し
    this.showMsg('Hello, Vue.js and TypeScript')
  }
  // 関数
  showMsg (msg: string) {
    this.message = msg
  } 
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}
</style>
