import {
  nodeURL,
  separator,
  entrypointNodeAddr,
  FeeContractAddr,
  gas,
  activationFee
}                     from './config'
import FeeContractAbi from './abi/activate_account.json'
import Web3           from 'web3'

export const web3 = new Web3(nodeURL)
export const feeContract = new web3.eth.Contract(FeeContractAbi, FeeContractAddr)

export const sendTx = async ({privateKey = '', addressFrom = '', addressTo = '', amount = 0}) => {
  if (!amount || !addressTo || !addressFrom || !privateKey) {
    return
  }
  const nonce = await getNonce(addressFrom)
  const data = separator.concat(web3.utils.hexToBytes(entrypointNodeAddr))
  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      from: addressFrom,
      to: addressTo,
      value: web3.utils.toWei(amount, 'ether'),
      gas,
      data: web3.utils.bytesToHex(data),
      nonce: nonce
    },
    privateKey
  )
  
  return web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
}

export const activateAccount = async ({privateKey = '', addressFrom = ''}) => {
  try {
    const nonce = await getNonce(addressFrom)
    const tx = feeContract.methods.pay()
    const methodEncoded = tx.encodeABI()
    const data = separator.concat(web3.utils.hexToBytes(entrypointNodeAddr)).concat(web3.utils.hexToBytes(methodEncoded))
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: addressFrom,
        to: FeeContractAddr,
        gas: '300000',
        data: web3.utils.bytesToHex(data),
        nonce: nonce,
	value: activationFee
      },
      privateKey
    )
    
    return await web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
  }
  catch (e) {
    console.log('activateAccount error', e.message)
    throw new Error(e.message)
  }
}

export const getNonce = async (addressFrom = '') => {
  if (!addressFrom) return
  
  return await web3.eth.getTransactionCount(addressFrom)
}
