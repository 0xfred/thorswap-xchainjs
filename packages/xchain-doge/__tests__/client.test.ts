import { baseAmount } from '@thorswap-lib/atlas'
import { Network } from '@thorswap-lib/types'

import mockSochainApi from '../__mocks__/sochain'
import { Client } from '../src/client'
import { AssetDoge, MIN_TX_FEE } from '../src/const'
// import { MIN_TX_FEE } from '../src/const'

mockSochainApi.init()

const dogeClient = new Client({ network: 'testnet' as Network })
// dogeClient.setPhrase('ship country company mistake figure photo file riot expire always rare tell')
// console.log(dogeClient.getAddress(0))

describe('DogecoinClient Test', () => {
  beforeEach(() => {
    dogeClient.purgeClient()
  })
  afterEach(() => dogeClient.purgeClient())

  const MEMO = 'SWAP:THOR.RUNE'
  const phraseOne = 'ship country company mistake figure photo file riot expire always rare tell'

  const testnet_address_path0 = 'nfVtm2hbz4rv1fhBVTqi5hGWrRzy5rqmLv'
  const testnet_address_path1 = 'nsUcSfSVREZ9jaMKrcKeZc8kKUJxj1Y7ms'
  const mainnet_address_path0 = 'D6Wmy5cmPMDmZjvQpvxk2XTzKhgPJ43ho9'
  const mainnet_address_path1 = 'DToAEBCvzfxqsZX2u4xkLfMXVbkyAwebkn'

  it('set phrase should return correct address', () => {
    dogeClient.setNetwork('testnet' as Network)
    const result = dogeClient.setPhrase(phraseOne)
    expect(result).toEqual(testnet_address_path0)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => dogeClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(dogeClient.setPhrase(phraseOne)).toBeUndefined
  })

  it('should purge phrase and utxos', async () => {
    dogeClient.purgeClient()
    expect(() => dogeClient.getAddress()).toThrow('Phrase must be provided')
  })

  it('should validate the right address', () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const address = dogeClient.getAddress()
    const valid = dogeClient.validateAddress(address)
    expect(address).toEqual('nfVtm2hbz4rv1fhBVTqi5hGWrRzy5rqmLv')
    expect(valid).toBeTruthy()
  })

  it('set phrase should return correct address', () => {
    dogeClient.setNetwork('testnet' as Network)
    expect(dogeClient.setPhrase(phraseOne)).toEqual(testnet_address_path0)
    expect(dogeClient.getAddress(1)).toEqual(testnet_address_path1)

    dogeClient.setNetwork('mainnet' as Network)
    expect(dogeClient.setPhrase(phraseOne)).toEqual(mainnet_address_path0)
    expect(dogeClient.getAddress(1)).toEqual(mainnet_address_path1)
  })

  it('should get the right balance', async () => {
    const expectedBalance = 10000000000
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const balance = await dogeClient.getBalance(dogeClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should get the balance of an address without phrase', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.purgeClient()
    const balance = await dogeClient.getBalance('nkJ3JHmpuWqu3eHyXByh67YmwDGep9bD3N')
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(1739730667)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    const expectedBalance = 10000000000
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)

    const balance = await dogeClient.getBalance(dogeClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)

    const newBalance = await dogeClient.getBalance(dogeClient.getAddress())
    expect(newBalance.length).toEqual(1)
    expect(newBalance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  // Some random 404 and useless error?
  // it('should broadcast a normal transfer', async () => {
  //   dogeClient.setNetwork('testnet' as Network)
  //   dogeClient.setPhrase(phraseOne)
  //   const amount = baseAmount(5000000000)
  //   const txid = await dogeClient.transfer({ asset: AssetDoge, recipient: testnet_address_path1, amount, feeRate: 1 })
  //   expect(txid).toEqual(expect.any(String))
  // })

  // Some random 404 and useless error?
  // it('should broadcast a normal transfer without feeRate', async () => {
  //   dogeClient.setNetwork('testnet' as Network)
  //   dogeClient.setPhrase(phraseOne)
  //   const amount = baseAmount(100)
  //   const txid = await dogeClient.transfer({ asset: AssetDoge, recipient: testnet_address_path0, amount })
  //   expect(txid).toEqual(expect.any(String))
  // })

  // Even weirder 404 error
  // it('should do broadcast a vault transfer with a memo', async () => {
  //   dogeClient.setNetwork('testnet' as Network)
  //   dogeClient.setPhrase(phraseOne)

  //   const amount = baseAmount(2223)
  //   try {
  //     const txid = await dogeClient.transfer({
  //       asset: AssetDoge,
  //       recipient: testnet_address_path0,
  //       amount,
  //       memo: MEMO,
  //       feeRate: 1,
  //     })
  //     expect(txid).toEqual(expect.any(String))
  //   } catch (err) {
  //     console.log('ERR running test', err)
  //     throw err
  //   }
  // })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)

    const asset = AssetDoge
    const amount = baseAmount(9999999999)
    return expect(
      dogeClient.transfer({ walletIndex: 0, asset, recipient: testnet_address_path1, amount, feeRate: 1 }),
    ).rejects.toThrow('Balance insufficient for transaction')
  })

  it('returns fees and rates of a normal tx', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const { fees, rates } = await dogeClient.getFeesWithRates()
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates of a tx w/ memo', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const { fees, rates } = await dogeClient.getFeesWithRates(MEMO)
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('should return estimated fees of a normal tx', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const estimates = await dogeClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx (in case of > MIN_TX_FEE only)', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const normalTx = await dogeClient.getFees()
    const vaultTx = await dogeClient.getFeesWithMemo(MEMO)

    if (vaultTx.average.amount().isGreaterThan(MIN_TX_FEE)) {
      expect(vaultTx.average.amount().isGreaterThan(normalTx.average.amount())).toBeTruthy()
    } else {
      expect(vaultTx.average.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
    }

    if (vaultTx.fast.amount().isGreaterThan(MIN_TX_FEE)) {
      expect(vaultTx.fast.amount().isGreaterThan(normalTx.fast.amount())).toBeTruthy()
    } else {
      expect(vaultTx.fast.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
    }

    if (vaultTx.fastest.amount().isGreaterThan(MIN_TX_FEE)) {
      expect(vaultTx.fastest.amount().isGreaterThan(normalTx.fastest.amount())).toBeTruthy()
    } else {
      expect(vaultTx.fastest.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
    }
  })

  it('returns different fee rates for a normal tx', async () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await dogeClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })

  it('should error when an invalid address is used in getting balance', () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'
    const expectedError = 'Could not get balances for address error_address'
    return expect(dogeClient.getBalance(invalidAddress)).rejects.toThrow(expectedError)
  })

  it('should error when an invalid address is used in transfer', () => {
    dogeClient.setNetwork('testnet' as Network)
    dogeClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    const expectedError = 'Invalid address'

    return expect(
      dogeClient.transfer({ asset: AssetDoge, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow(expectedError)
  })

  it('should get address transactions', async () => {
    dogeClient.setNetwork('testnet' as Network)

    const txPages = await dogeClient.getTransactions({ address: 'nVhTSAcDWg5PihJA7FCx6G6jLexRz7qhsB', limit: 4 })

    expect(txPages.total).toEqual(2)
    expect(txPages.txs[0].asset).toEqual(AssetDoge)
    expect(txPages.txs[0].date).toEqual(new Date('2021-12-22T00:39:13.000Z'))
    expect(txPages.txs[0].hash).toEqual('4fce59ffd0c5318b0f387afa2f1b7a94ede142f722f714891dd31563f3dbda34')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(2)
    expect(txPages.txs[0].from.length).toEqual(1)
  })

  // Almost works: limit does not seem to work
  it('should get address transactions with limit', async () => {
    dogeClient.setNetwork('testnet' as Network)

    // Limit should work
    const txPages = await dogeClient.getTransactions({ address: 'nVhTSAcDWg5PihJA7FCx6G6jLexRz7qhsB', limit: 1 })
    return expect(txPages.txs.length).toEqual(1)
  })

  it('should get transaction with hash', async () => {
    const hash = 'ff0323c5574ba0b90c543dc1aa3153c07ee4be74400c50870b8086499c76fed9'
    dogeClient.setNetwork('testnet' as Network)
    const txData = await dogeClient.getTransactionData(hash)

    expect(txData.hash).toEqual(hash)
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('na58Cr7MVPhnNXa2zXqrumNaTLz5p5aecS')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(5 * 1e8, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual('nddntqAURpDYBdre42BDk1dg3vVfE6WapA')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(1 * 1e8, 8).amount())).toBeTruthy()
    expect(txData.to[1].to).toEqual('nbo3KyDVfdj4mcV1oCZTBwWyoRyFMf2Ah4')
    expect(txData.to[1].amount.amount().isEqualTo(baseAmount(3.774 * 1e8, 8).amount())).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    dogeClient.setNetwork('mainnet' as Network)
    expect(dogeClient.getExplorerUrl()).toEqual('https://blockchair.com/dogecoin')

    dogeClient.setNetwork('testnet' as Network)
    expect(dogeClient.getExplorerUrl()).toEqual('https://blockexplorer.one/dogecoin/testnet')
  })

  it('should rerun valid explorer address url', () => {
    dogeClient.setNetwork('mainnet' as Network)
    expect(dogeClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://blockchair.com/dogecoin/address/testAddressHere',
    )

    dogeClient.setNetwork('testnet' as Network)
    expect(dogeClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockexplorer.one/dogecoin/testnet/address/anotherTestAddressHere',
    )
  })

  it('should rerun valid explorer tx url', () => {
    dogeClient.setNetwork('mainnet' as Network)
    expect(dogeClient.getExplorerTxUrl('testTxHere')).toEqual('https://blockchair.com/dogecoin/transaction/testTxHere')

    dogeClient.setNetwork('testnet' as Network)
    expect(dogeClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockexplorer.one/dogecoin/testnet/tx/anotherTestTxHere',
    )
  })
})
