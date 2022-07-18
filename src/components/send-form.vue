<template lang="pug">
.send
  el-row(class="mb-16" justify="space-between")
    el-col(:span="12")
      h3 Send Transaction
    el-col(:span="7" v-if="addressTo")
      el-button(size="small" @click="fillData") Fill ({{ fillBtnText }})
  el-row(class="mb-16")
    el-input(v-model="tx.addressTo" placeholder="Sent to")
  el-row(class="mb-16")
    el-input(v-model="tx.amount" placeholder="Amount")
  el-row(class="mb-16" )
    el-col(:span="6")
      el-button(@click="sendTx" :loading="loading") Submit
    el-col(:span="18")
      el-alert(v-if="errorMsg || successMsg"
        class="break-words"
        :title="errorMsg || successMsg"
        :type="computedAlertType" show-icon
      @close="closeAlert")
        a(v-if="txHash" :href="`${explorerUrl}/tx/${txHash}`" target="_blank") {{ txHash }}
</template>

<script>
import * as graphite from '@/graphite'
import {explorerUrl} from '@/graphite/config'

export default {
  name: 'SendForm',
  props: {
    privateKey: {
      type: String,
      default: null
    },
    addressFrom: {
      type: String,
      default: null
    },
    addressTo: {
      type: String,
      default: null
    },
    fillBtnText: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      tx: {
        addressTo: '',
        amount: ''
      },
      errorMsg: null,
      successMsg: null,
      loading: false,
      txHash: null,
      explorerUrl: explorerUrl
    }
  },
  computed: {
    computedAlertType() {
      return this.errorMsg ? 'error' : 'success'
    }
  },
  watch: {},
  methods: {
    async sendTx() {
      this.loading = true
      const data = {
        ...this.tx,
        addressFrom: this.addressFrom,
        privateKey: this.privateKey
      }
      this.txHash = null
      try {
        const sendTxResponse = await graphite.sendTx(data)
        this.loading = false

        if (sendTxResponse) {
          this.successMsg = 'Successfully sent!'
          this.errorMsg = null
          this.txHash = sendTxResponse.transactionHash
        }
      }
      catch (e) {
        console.log('sendTx e', e)
        this.errorMsg = e.message
        this.successMsg = null
        this.loading = false
      }
    },
    fillData() {
      this.tx.addressTo = this.addressTo
    },
    clearForm() {
      this.tx.addressTo = ''
      this.tx.amount = ''
    },
    closeAlert() {
      this.successMsg = null
      this.errorMsg = null
      this.txHash = null
    }
  }
}
</script>

<style lang="scss" scoped>
.send {
}

.el-row {
  width: 100%;
}
</style>
