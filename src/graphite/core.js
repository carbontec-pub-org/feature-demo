import {Wallet}               from 'ethers'
import * as api               from './api'
import {getAccountReputation} from './reputation'
import {feeContract} from './index'

import {
  FeeContractAddr,
  activationMethodSuffix
}                             from './config'

export const getWallet = ({mnemonic = '', key = ''}) => {
  let wallet = null
  
  if (mnemonic) {
    wallet = Wallet.fromMnemonic(mnemonic)
  } else if (key) {
    wallet = new Wallet(key)
  }
  
  return wallet
}

export const getAccount = async ({mnemonic = '', key = ''}) => {
  const wallet = getWallet({mnemonic, key})
  const {balance} = await api.getAccountInfo(wallet.address)
  const accountActive = await feeContract.methods.paidFee(wallet.address).call()
  // const reputation = await getAccountReputation(wallet.address, accountActive)
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance,
    accountActive: accountActive,
    reputation: {
      value: 0
    }
  }
}

export const updateAccountInfo = async (address = '') => {
  const {balance} = await api.getAccountInfo(address)
  const accountActive = await feeContract.methods.paidFee(address).call()
  // const reputation = await getAccountReputation(address, accountActiveTx, txs)
  
  return {
    balance,
    accountActive,
    reputation: {
      value: 0
    }
  }
}

export const checkActivation = (txs = []) => {
  if (!txs) return false
  
  return txs.find(tx =>
    tx.to === FeeContractAddr &&
    tx.input.includes(activationMethodSuffix) &&
    (tx.isError === '0' || !tx.isError)
  )
}

