import axios      from 'axios'
import {utils}    from 'ethers'
import {proxyUrl} from '@/graphite/config'
import {web3}     from '@/graphite/index'

let history = {
  blockNumber: 0,
  txs: []
}

export const getTxsFromBlocksWeb3 = async () => {
  const startBlock = 0
  const endBlock = await web3.eth.getBlockNumber()
  if (history.blockNumber === endBlock) {
    return history.txs
  }
  history.blockNumber = endBlock
  for (let i = startBlock; i <= endBlock; i++) {
    const block = await web3.eth.getBlock(i, true)
    history.txs.push(...block.transactions)
  }
  
  return history.txs
}

export const getTxList = async (address = '') => {
  try {
    const res = await axios.post(proxyUrl, {
      module: 'account',
      action: 'txlist',
      address
    })
    
    if (res.status === 200) {
      return res.data?.result
    }
    return []
  }
  catch (e) {
    console.log('getTxList error', e)
  }
}

export const getTxListWeb3 = async (address  = '') => {
  try {
    address = address.toLowerCase()
    const allTxs = await getTxsFromBlocksWeb3()
    if (allTxs && allTxs.length) {
      return allTxs.filter(item => {
        return item && (item?.to?.toLowerCase() === address ||
          item?.from?.toLowerCase() === address)
      })
    } else return []
  }
  catch (e) {
    console.log('getTxList error', e)
  }
}

export const getBalance = async (address = '') => {
  try {
    const res = await axios.post(proxyUrl, {
      module: 'account',
      action: 'balance',
      address
    })
    
    if (res.status === 200) {
      return utils.formatEther(res.data?.result)
    }
    return 0
  }
  catch (e) {
    console.log('getBalance error', e)
  }
}

export const getBalanceWeb3 = async (address = '') => {
  try {
    const res = await web3.eth.getBalance(address)
    
    if (res) {
      return utils.formatEther(res)
    }
    return 0
  }
  catch (e) {
    console.log('getBalanceWeb3 error', e)
  }
}

export const getAccountInfo = async (address = '') => {
  const balance = await getBalanceWeb3(address)
  // const txs = await getTxList(address)
  
  return {
    balance,
    // txs
  }
}

export const getLastBlock = async () => {
  try {
    return await web3.eth.getBlockNumber()
  }
  catch (e) {
    console.log('getLastBlock error', e)
  }
}
