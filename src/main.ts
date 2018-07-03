// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'vuetify/dist/vuetify.css'
// 追加
import Vuetify from 'vuetify'
import colors from 'vuetify/es5/util/colors'
import 'vue2-toast/lib/toast.css'
import Toast from 'vue2-toast'
import VueQriously from 'vue-qriously'
import VueQrcodeReader from 'vue-qrcode-reader'

Vue.use(Vuetify, {
  theme: {
    original: colors.purple.base,
    theme: '#FFDEEA',
    background: '#FFF6EA',
    view: '#ffa07a',
    select: '#FF7F78',
    button: '#5FACEF'
  },
  options: {
    themeVariations: ['original', 'secondary']
  }
})
Vue.use(Toast, {
  defaultType: 'bottom',
  duration: 3000,
  wordWrap: true,
  width: '280px'
})
Vue.use(VueQriously)
Vue.use(VueQrcodeReader)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
