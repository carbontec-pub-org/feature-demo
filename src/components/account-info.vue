<template lang="pug">
.account
  .account-header
    .account-header__title
      h2 Account {{ accountNumber }}
    .account-header__btn
      el-button(v-if="showReloadBtn" size="small" @click="reloadAccount") Reload
  .account-body
    el-row(class="mb-16")
      el-input(
        v-model="mnemonicOrKey"
        :rows="2"
        type="textarea"
        placeholder="Mnemonic or PrvKey")
    .account-info(v-if="accountLocal.data")
      el-row(:gutter="20" class="mb-16")
        el-col(:span="6") Address
        el-col(:span="18" class="break-words")
          a(:href="computedExplUrl" target="_blank") {{ accountLocal.data?.address }}
      el-row(:gutter="20" class="mb-16")
        el-col(:span="6") Balance
        el-col(:span="18") {{ accountLocal.data?.balance }} @G
      el-row.account-status-wr(:gutter="20" class="mb-16")
        el-col(:span="10") Account activated
        el-col.account-status(:span="4"
          :class="{'is-active': accountLocal.data?.accountActive}") {{ accountLocal.data?.accountActive }}
        el-col.account-btn(
          :span="10")
          el-button(v-if="!accountLocal.data?.accountActive"
            size="small"
            @click="activateAccount"
            :loading="activateBtn.loading") {{ activateBtn.text }}
      el-row(v-if="transactionHash || activationError" :gutter="20" class="mb-16")
        el-alert(
          v-if="transactionHash"
          class="break-words"
          title="Successfully activated"
          type="success" show-icon @close="closeAlert")
          a(:href="`${explorerUrl}/tx/${transactionHash}`" target="_blank") {{ transactionHash }}
        el-alert(v-if="activationError"
          class="break-words"
          title="Fail"
          :description="activationError"
          type="error" @close="closeAlert")
      el-row(:gutter="20" class="mb-16" v-if="accountLocal.data?.reputation.value")
        el-col(:span="6") Reputation
        el-col(:span="18") {{ accountLocal.data?.reputation.value }}
</template>

<script>
import * as core         from '@/graphite/core'
import {activateAccount} from '@/graphite'
import {explorerUrl}     from '@/graphite/config'

export default {
  name: 'AccountInfo',
  components: {},
  model: {
    prop: 'account',
    event: 'accountChanged'
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    accountNumber: {
      type: Number,
      default: 1
    },
    clear: {
      type: Boolean,
      default: false
    },
    startLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['accountChanged'],
  data() {
    return {
      mnemonicOrKey: '',
      activateBtn: {
        loading: false,
        defaultText: 'Activate',
        text: 'Activate'
      },
      showReloadBtn: false,
      explorerUrl: explorerUrl,
      transactionHash: null,
      activationError: null
    }
  },
  computed: {
    accountLocal: {
      get() {
        return this.account
      },
      set(value) {
        this.$emit('accountChanged', value)
      }
    },
    computedExplUrl() {
      return `${ explorerUrl }/address/${ this.accountLocal.data.address }/transactions`
    }
  },
  watch: {
    mnemonicOrKey(newVal, oldVal) {
      if (oldVal) {
        this.showReloadBtn = true
      }
    },
    clear(val) {
      if (val) {
        this.mnemonicOrKey = ''
      }
    },
    startLoading(val) {
      if (val) this.getAccount()
    }
  },
  created() {
    this.mnemonicOrKey = this.accountLocal.mnemonic || this.accountLocal.key
  },
  methods: {
    async getAccount() {
      if (this.mnemonicOrKey.includes(' ')) {
        this.accountLocal.data = await core.getAccount({mnemonic: this.mnemonicOrKey})
      } else {
        this.accountLocal.data = await core.getAccount({key: this.mnemonicOrKey})
      }
    },
    async activateAccount() {
      this.activateBtn.loading = true
      try {
        const res = await activateAccount({
          privateKey: this.accountLocal.data.privateKey,
          addressFrom: this.accountLocal.data.address
        })
        this.activateBtn.loading = false

        if (res && res.transactionHash) {
          this.activateBtn.text = 'Success'
          this.transactionHash = res.transactionHash
        } else {
          this.activateBtn.text = 'Fail'
        }
      }
      catch (e) {
        this.activateBtn.loading = false
        this.activateBtn.text = 'Fail'
        this.activationError = e?.message || e
      }

      setTimeout(() => {
        this.activateBtn.text = this.activateBtn.defaultText
      }, 3000)
    },
    reloadAccount() {
      this.getAccount()
      this.showReloadBtn = false
    },
    closeAlert() {
      this.activationError = null
      this.transactionHash = null
    }
  }
}
</script>

<style lang="scss" scoped>
.account-header {
  display: flex;
  justify-content: space-between;
}

.account-status-wr {
  min-height: 32px;
}

.account-status {
  color: var(--color-danger);

  &.is-active {
    color: var(--color-success);
  }
}

.account-btn {
  display: flex !important;
  justify-content: flex-end;
}
</style>
