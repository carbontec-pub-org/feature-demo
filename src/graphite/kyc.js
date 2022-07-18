import KYCContractAbi                                   from './abi/kyc_contract.json'
import {getNonce, web3}                                 from '@/graphite/index'
import {entrypointNodeAddr, KYCContractAddr, separator} from '@/graphite/config'

const KYCCenterKey = 'ed4c65f1bf6c622f5954ff39932c192b26a963abcc65d56f9487d4cabe9301f1'
export const center = web3.eth.accounts.privateKeyToAccount(KYCCenterKey)
export const kycContract = new web3.eth.Contract(KYCContractAbi, KYCContractAddr)
const defaultValue = '2000000000000000000' // 2

export const getKYCLevel = async (address = '') => {
  return await kycContract.methods.level(address).call()
}

export const createKYCRequest = async ({address = '', privateKey = '', newLevel = 0}) => {
  try {
    const nonce = await getNonce(address)
    const levelData = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const tx = await kycContract.methods.createKYCRequest(newLevel, levelData)
    const methodEncoded = tx.encodeABI()
    const data = separator.concat(web3.utils.hexToBytes(entrypointNodeAddr)).concat(web3.utils.hexToBytes(methodEncoded))
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: address,
        to: KYCContractAddr,
        gas: '300000',
        data: web3.utils.bytesToHex(data),
        nonce,
        value: defaultValue
      },
      privateKey
    )
    
    return web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
  }
  catch (e) {
    console.log('createKYCRequest error', e)
    return false
  }
}

export const viewMyRequests = async (address = '') => {
  try {
    const res = await kycContract.methods.viewMyLastRequest().call({from: address})
    
    return res
  }
  catch (e) {
    console.log('viewMyRequests error', e)
    return null
  }
}

export const viewRequestAssignedToCentre = async (localKYCIndex = 0) => {
  try {
    const {address} = center // KYC center address
    return await kycContract.methods.viewRequestAssignedToCentre(address, localKYCIndex).call()
  }
  catch (e) {
    console.log('viewRequestAssignedToCentre error', e)
  }
}

// 0 - pending, 1 - declined, 2 - approved, 3 - withdrawn
export const getLastRequest = async (address = '') => {
  try {
    const lastIndex = await getLastRequestIndex(address)
    if (!lastIndex) return
    const data = await getRequestByIndex(lastIndex)
    
    if (data.status === '0') {
      return {
        lastIndex,
        data
      }
    } else return null
  }
  catch (e) {
    console.log('getLastRequest e', e)
  }
}

export const getLastRequestIndex = async (address = '') => {
  try {
    return await kycContract.methods.getLastGlobalRequestIndexOfAddress(address).call()
  }
  catch (e) {
    console.log('getLastRequestIndex e') 
  }
}

export const getRequestByIndex = async (index = 0) => {
  try {
    return await kycContract.methods.kycRequests(index).call()
  }
  catch (e) {
    console.log('getRequestByIndex error', e)
  }
}

export const asCenterDeclineRequest = async ({centerAddress = '', index = 0}) => {
  try {
    const nonce = await getNonce(centerAddress)
    const privateKey = getCenterPrivateKey(centerAddress)
    const tx = await kycContract.methods.declineRequest(index)
    const methodEncoded = tx.encodeABI()
    const data = separator.concat(web3.utils.hexToBytes(entrypointNodeAddr)).concat(web3.utils.hexToBytes(methodEncoded))
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: centerAddress,
        to: KYCContractAddr,
        gas: '300000',
        data: web3.utils.bytesToHex(data),
        nonce
      },
      privateKey)
    
    return web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
  }
  catch (e) {
    console.log('asCenterDeclineRequest error', e)
  }
}

export const asCenterApproveRequest = async ({centerAddress = '', index = 0}) => {
  try {
    const nonce = await getNonce(centerAddress)
    const encoded = await kycContract.methods.approveKYCRequest(index).encodeABI()
    const data = separator.concat(web3.utils.hexToBytes(entrypointNodeAddr)).concat(web3.utils.hexToBytes(encoded))
    
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: centerAddress,
        to: KYCContractAddr,
        gas: '300000',
        data: web3.utils.bytesToHex(data),
        nonce
      },
      KYCCenterKey)
    return web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
  }
  catch (e) {
    console.log('asCenterApproveRequest error', e)
  }
}

const getCenterPrivateKey = (address = '') => {
  if (center.address === address) return center.privateKey
}
