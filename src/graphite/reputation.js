import * as api      from '@/graphite/api'
import {getKYCLevel} from '@/graphite/kyc'

export const getAccountReputation = async (walletAddress = '', activationTx = {}, txs = []) => {
  const A = activationTx && activationTx.hash ? 1 : 0
  const QTx = getQTx(txs.length)
  const CD = await getCD(activationTx)
  const KYC = await getKYC(walletAddress)
  const Diff = getDiff(walletAddress, txs)
  
  const reputation = CD + A + KYC + QTx + Diff
  
  return {
    CD,
    A,
    KYC,
    QTx,
    Diff,
    value: reputation
  }
}

const getQTx = (txsCount = 0) => {
  if (!txsCount) return 0
  
  const QTxRanges = {
    10: 0.05,
    100: 0.3,
    500: 0.5,
    1000: 0.8
  }
  
  let QTx = 0
  for (const range in QTxRanges) {
    if (txsCount <= range) {
      QTx = QTxRanges[range]
      break
    }
  }
  
  if (txsCount > 1000) {
    QTx = 1
  }
  
  return QTx
}

const getCD = async (activationTx = {}) => {
  if (!activationTx || !activationTx.hash) return 0
  
  const lastBlock = await api.getLastBlock()
  const diff = lastBlock - activationTx.blockNumber
  const maxBlockNumber = 100000
  const CDRange = {
    10000: 0,
    50000: 0.5,
    100000: 0.7
  }
  let CD = 0
  
  for (const range in CDRange) {
    if (diff <= range) {
      CD = CDRange[range]
      break
    }
  }
  if (diff > maxBlockNumber) {
    CD = 1
  }
  
  return CD
}

const getKYC = async (walletAddress = '') => {
  const KYCLevel = await getKYCLevel(walletAddress)
  let KYC = 0
  
  switch (+KYCLevel) {
    case 1:
      KYC = 1
      break
    case 2:
      KYC = 3
      break
    default:
      KYC = 0
  }
  
  return KYC
}
const getDiff = (walletAddress = '', txs = []) => {
  let allIn = 0
  let allOut = 0
  walletAddress = walletAddress.toUpperCase()
  
  for (let tx of txs) {
    if (tx.from.toUpperCase() === walletAddress) {
      allOut += +tx.value
    } else {
      allIn += +tx.value
    }
  }
  
  const diff = allIn - allOut
  
  return diff > 0.1 ? 0.5 : 0
}
