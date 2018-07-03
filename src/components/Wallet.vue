<template>
<div class="wallet">
    <v-flex xs12 sm6 offset-sm3>
    <v-card>
      <v-container fluid>
        <v-card flat>
          <v-card-title><b>残高</b></v-card-title>
          <v-card-text>{{ wallet.balance }} xem</v-card-text>
          <v-card-title><b>送金先アドレス</b></v-card-title>
          <v-card-text>{{ wallet.address }}</v-card-text>
          <v-card flat><qriously v-model="qrJson" :size="qrSize" ></qriously></v-card>
        </v-card>
        <v-card flat>
          <v-card-title><b>送金</b></v-card-title>
          <v-form v-model="valid" ref="form" lazy-validation>
            <v-text-field
              label="送金先"
              v-model="toAddr"
              :rules="[]"
              :counter="40"
              required
              placeholder="例. NBHWRG6STRXL2FGLEEB2UOUCBAQ27OSGDTO44UFC"
            ></v-text-field>
            <v-text-field
              box
              label="NEM"
              v-model="toAmount"
              :rules="[rules.amountLimit, rules.amountInput]"
              type="number"
              required
            ></v-text-field>
            <v-text-field
              label="メッセージ"
              v-model="message"
              :rules="[rules.messageRules]"
              :counter="1024"
              placeholder="例. ありがとう"
            ></v-text-field>
          </v-form>
          <v-flex>
            <v-btn color="blue" class="white--text" :click="tapSend()">送金</v-btn>
          </v-flex>
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
    qrSize: 200,
    toAmount: 0,
    toAddr: '',
    message: '',
    valid: false,
    rules: {
      senderAddrLimit: (value:string) => (value && (value.length === 46 || value.length === 40)) || '送金先アドレス(-除く)は40文字です。',
      senderAddrInput: (value:string) => {
        const pattern = /^[a-zA-Z0-9-]+$/
        return pattern.test(value) || '入力が不正です'
      },
      amountLimit: (value:number) => (value >= 0) || '金額を入力してください',
      amountInput: (value:string) => {
        const pattern = /^[0-9.]+$/
        return (pattern.test(value) && !isNaN(Number(value))) || '入力が不正です'
      },
      messageRules: (value:string) => (value.length <= 1024) || '最大文字数を超えています。'
    }
  }),
  watch: {
    'wallet.address' (newVal, oldVal) {
      this.$data.qrJson = this.$data.nem.getQRcodeJson('2', 2, '', newVal, 0, '')
    }
  }
})

export default class Wallet extends Vue {
  wallet:walletModel = new walletModel()
  mounted () {
    console.log('mounted Wallet')
  }
  tapSend() {
  }
}
</script>
<style scoped>
.wallet {
  word-break: break-all;
}
</style>
