<template>
<div class="wallet">
    <v-flex xs12 sm6 offset-sm3>
    <v-card>
      <v-container fluid>
        <v-card flat>
          <v-card-actions>
            <v-card-title><b>残高</b></v-card-title>
            <v-spacer />
            <v-btn fab small flat @click="getAccount()" :loading="isLoading"><v-icon>cached</v-icon></v-btn>
          </v-card-actions>
          <v-card-text>{{ wallet.balance }} xem</v-card-text>
          <v-card-title><b>送金先アドレス</b></v-card-title>
          <v-card-text>{{ wallet.address }}</v-card-text>
          <v-card flat><qriously v-model="qrJson" :size="qrSize" ></qriously></v-card>
        </v-card>
        <v-card flat>
          <div v-for="(item, index) in validation" :key="index" class="errorLabel">
            <div v-if="item!==true">{{ item }}</div>
          </div>
          <v-card-title><b>送金</b></v-card-title>
            <v-text-field
              label="送金先"
              v-model="toAddr"
              :counter="40"
              required
              placeholder="例. NBHWRG6STRXL2FGLEEB2UOUCBAQ27OSGDTO44UFC"
            ></v-text-field>
            <v-text-field
              label="NEM"
              v-model="toAmount"
              type="number"
              required
            ></v-text-field>
          <v-text-field
            label="メッセージ"
            v-model="message"
            :counter="1024"
            placeholder="例. ありがとう"
          ></v-text-field>
          <v-flex>
            <v-btn color="blue" class="white--text" @click="tapSend()">送金</v-btn>
          </v-flex>
        </v-card>
        <v-card>
          <v-card-actions>
            <v-card-title><b>マルチシグ機能</b></v-card-title>
          </v-card-actions>
          <div><v-btn color="blue" class="white--text" @click="tapMultisigAccount">マルチシグアカウント作成</v-btn></div>
          <div><v-btn color="blue" class="white--text" @click="tapModifuMultisigAccount">署名者追加</v-btn></div>
          <div><v-btn color="blue" class="white--text" @click="tapSendMultisigAccount">NEMを送金</v-btn></div>
          <div><v-btn color="blue" class="white--text" @click="tapSendMosaicMultisigAccount">モザイクを送金</v-btn></div>
          <div><v-btn color="blue" class="white--text" @click="tapGetTransaction">マルチシグ履歴確認</v-btn></div>
          <div><v-btn color="blue" class="white--text" @click="tapGetUnconfirmedTx">未承認履歴確認</v-btn></div>
          <div><v-btn color="blue" class="white--text" @click="tapSignMultisig">署名者2の署名</v-btn></div>
        </v-card>
      </v-container>
    </v-card>
    </v-flex>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import nemWrapper from '../ts/nemWrapper'
import walletModel from '../ts/walletModel'

@Component({
  name: 'wallet',
  data: () => ({
    nem: new nemWrapper(),
    qrJson: '',
    rules: {
      senderAddrLimit: (value:string) => (value && (value.length === 46 || value.length === 40)) || '送金先アドレス(-除く)は40文字です。',
      senderAddrInput: (value:string) => {
        const pattern = /^[a-zA-Z0-9-]+$/
        return pattern.test(value) || '送金先の入力が不正です'
      },
      amountLimit: (value:number) => (value >= 0) || '数量を入力してください',
      amountInput: (value:string) => {
        const pattern = /^[0-9.]+$/
        return (pattern.test(value) && !isNaN(Number(value))) || '数量の入力が不正です'
      },
      messageRules: (value:string) => (value.length <= 1024) || 'メッセージの最大文字数が超えています。'
    }
  }),
  watch: {
    'wallet.address' (newVal, oldVal) {
      this.$data.qrJson = this.$data.nem.getQRcodeJson('2', 2, '', newVal, 0, '')
    }
  },
  methods: {

  }
})

export default class Wallet extends Vue {
  isLoading:boolean = false
  wallet:walletModel = new walletModel()
  qrSize:number = 200
  toAmount:number = 0
  toAddr:string = ''
  message:string = ''
  validation:Array<any> = []

  nem = new nemWrapper()

  mounted () {
  }
  async getAccount () {
    this.isLoading = true
    await this.wallet.getAccount()
    this.isLoading = false
  }
  async tapSend() {
    console.log('tapSend')
    if (this.isValidation() === true) {
      let result = await this.wallet.sendNem(this.toAddr, this.toAmount, this.message)
      console.log('tapSend', result)
      let message = '送金しました'
      if (result.message !== 'SUCCESS') {
        message = "Error " + result.message
      }
      Vue.prototype.$toast(message)
    }
  }
  tapMultisigAccount() {
    this.nem.testMultisig()
  }
  tapSendMultisigAccount() {
    this.nem.testSendMultisig()
  }
  tapSendMosaicMultisigAccount() {
    this.nem.testSendMosaicMultisig()
  }
  tapGetTransaction() {
    this.nem.testGetTransaction()
  }
  tapGetUnconfirmedTx() {
    this.nem.testGetUncofirmedTx()
  }
  tapModifuMultisigAccount() {
    this.nem.testModifyMultisig()
  }
  tapSignMultisig() {
    this.nem.testSignMultisig()
  }
  isValidation(): Boolean {
    this.validation = []
    this.validation.push(this.$data.rules.senderAddrLimit(this.toAddr))
    this.validation.push(this.$data.rules.senderAddrInput(this.toAddr))
    this.validation.push(this.$data.rules.amountLimit(this.toAmount))
    this.validation.push(this.$data.rules.amountInput(this.toAmount))
    this.validation.push(this.$data.rules.messageRules(this.message))
    console.log(this.validation)
    let isError:Boolean = false
    this.validation.forEach((obj:any) => {
      if (obj !== true) { isError = true }
    })
    return !isError
  }
}
</script>
<style scoped>
.wallet {
  word-break: break-all;
}
.errorLabel {
  color: red;
}
</style>
