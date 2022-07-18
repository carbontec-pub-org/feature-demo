<template lang="pug">
main
  .header
    el-row(align="middle")
      el-col(:span="12")
        h1 Graphite KYC Demo
      el-col.flex.jc-space-between(:span="12")
        el-button(@click="clearAccounts" type="info") Clear
        el-button(@click="startReload" :loading="reloading") Reload
  .screens(v-loading="!blocksLoaded")
    .screen
      account-info(
        :account="account1"
        :account-number="1"
        :clear="account2.startClear"
        :startLoading="blocksLoaded"
      )
      el-divider
      send-form(
        :privateKey="account1.data?.privateKey"
        :addressFrom="account1.data?.address"
        :addressTo="account2.data?.address"
        fillBtnText="Account 2")
      el-divider
      kyc-form(
        :address="account1.data?.address"
        :privateKey="account1.data?.privateKey")
      el-divider
      filter-form(
        :address="account1.data?.address"
        :privateKey="account1.data?.privateKey")
    .screen
      account-info(
        :account="account2"
        :account-number="2"
        :clear="account2.startClear"
        :startLoading="blocksLoaded"
      )
      el-divider
      send-form(
        :privateKey="account2.data?.privateKey"
        :addressFrom="account2.data?.address"
        :addressTo="account1.data?.address"
        fillBtnText="Account 1")
      el-divider
      kyc-form(
        :address="account2.data?.address"
        :privateKey="account2.data?.privateKey")
      el-divider
      filter-form(
        :address="account2.data?.address"
        :privateKey="account2.data?.privateKey")
    .screen
      kyc-center(:addresses="addresses")
</template>

<script>
import {updateAccountInfo} from '@/graphite/core'
import sendForm            from '@/components/send-form'
import accountInfo         from '@/components/account-info'
import kycForm             from '@/components/kyc-form'
import kycCenter           from '@/components/kyc-center'
import filterForm          from '@/components/filter-form'

export default {
  name: 'App',
  components: {
    sendForm,
    accountInfo,
    kycForm,
    kycCenter,
    filterForm
  },
  data() {
    return {
      account1: {
        mnemonic: 'vacuum finger equip siren language among scrub tobacco bike drop mango risk',
        key: null,
        data: null,
        startClear: false
      },
      account2: {
        // mnemonic: 'hurry donate juice host alarm forum labor coral sleep slim month cherry upon fog spatial',
        key: '05a7fff2ccc191cd42a1ad6f58b0eecdaae38b768d7b8a07c8ff22816368fa35',
        data: null,
        startClear: false
      },
      reloading: false,
      interval: null,
      intervalTime: 10000,
      blocksLoaded: false
    }
  },
  computed: {
    addresses() {
      if (this.account1.data?.address && this.account2.data?.address) {
        return [this.account1.data.address, this.account2.data.address]
      } else return []
    }
  },
  async mounted() {
    this.blocksLoaded = true
    this.interval = setInterval(async () => {
      await this.updateAccounts()
    }, this.intervalTime)
  },
  methods: {
    async startReload() {
      this.reloading = true
      await this.updateAccounts()
      this.reloading = false
    },
    async updateAccounts() {
      const data1 = await updateAccountInfo(this.account1.data.address)
      for (let key in data1) {
        this.account1.data[key] = data1[key]
      }

      const data2 = await updateAccountInfo(this.account2.data.address)
      for (let key in data2) {
        this.account2.data[key] = data2[key]
      }
      this.emitter.emit('resyncKYCLevel')
      this.emitter.emit('resyncFilterLevel')
      this.emitter.emit('resyncKYCRequests')
    },
    clearAccounts() {
      this.account1.startClear = true
      this.account2.startClear = true
      setTimeout(() => {
        this.clearAccount(this.account1)
        this.clearAccount(this.account2)
        clearInterval(this.interval)
      }, 0)
    },
    clearAccount(account) {
      for (let key in account) {
        const type = typeof account[key]
        if (type === 'object') {
          account[key] = {
            accountActive: false,
            address: '',
            balance: '',
            privateKey: '',
            reputation: {},
            txs: []
          }
        } else if (type === 'boolean') {
          account[key] = false
        } else {
          account[key] = ''
        }
      }
    }
  }
}
</script>

<style lang="scss">
:root {
  --color-success: #67c23a;
  --color-danger: #f56c6c;
  --color-blue: #66b1ff;
}

main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.header {
  margin: 30px 0;
}

.screens {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 80vh;
  gap: 10px;
}

.screen {
  flex: 1 0 30%;
  padding: 10px;
  border: 2px solid rgba(black, 0.2);
}

.break-words {
  word-break: break-word;
}

.mb-16 {
  margin-bottom: 16px;
}

h1, h2, h3 {
  margin: 0;
}

h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.flex {
  display: flex !important;
}

.jc-end {
  justify-content: flex-end;
}

.jc-space-between {
  justify-content: flex-end;
}

a {
  color: black;

  &:hover {
    text-decoration: none;
  }
}

.el-alert__title {
  font-weight: bold;
}
</style>
