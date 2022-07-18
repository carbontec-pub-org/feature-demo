import FilterContractAbi                                                    from './abi/filter_contract.json'
import {entrypointNodeAddr, FilterContractAddr, separator} from './config'
import {getNonce, web3}                                                     from '@/graphite/index'

const filterContract = new web3.eth.Contract(FilterContractAbi, FilterContractAddr, {from: '0x1D9f2C01c8A20DcC59e806caFF5f46033e84ad2B'})

export const viewFilterLevel = async (address = '') => {
  return await filterContract.methods.viewFilterLevel().call({from: address})
}

export const setFilterLevel = async ({address = '', privateKey = '', newLevel = 0}) => {
  const nonce = await getNonce(address)
  const encoded = await filterContract.methods.setFilterLevel(newLevel).encodeABI()
  const data = separator.concat(web3.utils.hexToBytes(entrypointNodeAddr)).concat(web3.utils.hexToBytes(encoded))
  
  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      from: address,
      to: FilterContractAddr,
      gas: '300000',
      data: web3.utils.bytesToHex(data),
      nonce
    },
    privateKey)
  
  return web3.eth.sendSignedTransaction(createTransaction.rawTransaction)
}
