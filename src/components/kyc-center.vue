<template lang="pug">
.kyc-center
  .kyc-center__head
    h2 KYC Center
  .kyc-center__body
    .request-empty(v-if="!requests.length") 0 requests
    .request(v-else v-for="item in requests")
      el-row
        el-col(:span="6") From
        el-col.break-words(:span="18") {{ item?.data[0].toLowerCase() }}
      el-row
        el-col(:span="6") To center
        el-col.break-words(:span="18") {{ item?.data.centre.toLowerCase() }}
      el-row
        el-col(:span="8") Requested level
        el-col.break-words(:span="16") {{ item?.data.level }}
      el-row
        el-button(@click="approveReq(item)" type="success" size="small") Approve
        el-button(@click="declineReq(item)" type="danger" size="small") Decline
    el-row
      el-alert(v-if="transactionHash"
        class="break-words"
        title="Success"
        type="success" show-icon)
        a(:href="`${explorerUrl}/tx/${transactionHash}`" target="_blank") {{ transactionHash }}
      el-alert(v-if="error"
        class="break-words"
        title="Fail"
        type="error" show-icon) {{ error }}
</template>

<script>
import * as kyc      from '@/graphite/kyc'
import {explorerUrl} from '@/graphite/config'

export default {
  name: 'KycCenter',
  components: {},
  props: {
    addresses: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      requests: [],
      transactionHash: null,
      error: null,
      explorerUrl: explorerUrl
    }
  },
  computed: {},
  watch: {
    addresses(newVal) {
      if (newVal.length) {
        this.getRequest()
      }
    }
  },
  mounted() {
    this.getRequest()
    this.emitter.on('resyncKYCRequests', this.getRequest)
  },
  beforeUnmount() {
    this.emitter.off('resyncKYCRequests', this.getRequest)
  },
  methods: {
    async getRequest() {
      const request = []
      for (let addr of this.addresses) {
        try {
          const lastReq = await kyc.getLastRequest(addr)
          if (lastReq) request.push(lastReq)
        }
        catch (e) {
          console.log(e)
        }
      }
      this.requests = [...request]
    },
    async approveReq(item) {
      this.transactionHash = null
      this.error = null

      try {
        const res = await kyc.asCenterApproveRequest({
          centerAddress: item.data.centre,
          index: item.lastIndex
        })
        if (res.transactionHash) {
          this.transactionHash = res.transactionHash
        }
      }
      catch (e) {
        this.error = e.message
        console.log(e)
      }
    },
    async declineReq(item) {
      this.transactionHash = null
      this.error = null
      try {
        const res = await kyc.asCenterDeclineRequest({
          centerAddress: item.data.centre,
          index: item.lastIndex
        })
        if (res.transactionHash) {
          this.transactionHash = res.transactionHash
        }
      }
      catch (e) {
        console.log(e)
        this.error = e.message
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.kyc-center {
}

.request {
  font-size: 14px;
  --color-gray: #c8c9cc;
  border: 1px solid var(--color-gray);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.el-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
