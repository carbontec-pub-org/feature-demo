<template lang="pug">
.filter
  el-row(class="mb-16" justify="space-between")
    el-col(:span="4")
      h3 Filter
  el-row(class="mb-16")
    el-col(:span="6") Level
    el-col(:span="18") {{ level }}
  el-row(class="mb-16" :gutter="20" justify="space-between")
    el-col(:span="8") Update level
    el-col(:span="8")
      el-input(v-model="newLevel" placeholder="Level")
    el-col(:span="8")
      el-button(@click="updateLevel" :loading="loading") Submit
  el-row(class="mb-16" :gutter="20" justify="space-between")
    el-alert(v-if="transactionHash"
      class="break-words"
      title="Success"
      type="success" show-icon)
      a(v-if="transactionHash" :href="`${explorerUrl}/tx/${transactionHash}`" target="_blank") {{ transactionHash }}
    el-alert(v-else-if="error" title="Fail" :description="error" type="error")
</template>

<script>
import * as filter      from '@/graphite/filter'
import {explorerUrl}    from '@/graphite/config'

export default {
  name: 'FilterForm',
  components: {},
  props: {
    address: {
      type: String,
      default: ''
    },
    privateKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      level: null,
      newLevel: '',
      loading: false,
      explorerUrl: explorerUrl,
      transactionHash: null,
      error: null
    }
  },
  computed: {},
  watch: {
    address(val) {
      if (val) {
        this.loadFilterLevel()
      }
    }
  },
  mounted() {
    this.emitter.on('resyncFilterLevel', this.loadFilterLevel)
  },
  beforeUnmount() {
    this.emitter.off('resyncFilterLevel', this.loadFilterLevel)
  },
  methods: {
    async loadFilterLevel() {
      this.level = await filter.viewFilterLevel(this.address)
    },
    async updateLevel() {
      if (!Number.isInteger(+this.newLevel)) return
      this.transactionHash = null
      this.loading = true
      try {
        const res = await filter.setFilterLevel({
          address: this.address,
          privateKey: this.privateKey,
          newLevel: this.newLevel
        })
        this.transactionHash = res.transactionHash
        this.loading = false
        this.error = null
      }
      catch (e) {
        this.loading = false
        this.transactionHash = null
        this.error = e.message
      }
    }
  }
}
</script>
