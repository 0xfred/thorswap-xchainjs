import { Balance, Network } from '@xchainjs/xchain-client'
import { Chain, baseAmount, baseToAsset } from '@xchainjs/xchain-util'

import { Client } from '../src'

describe('Client Test', () => {
  let terraClient: Client
  const phrase = process.env.PHRASE

  beforeEach(() => {
    terraClient = new Client({ phrase, network: 'testnet' as Network })
  })

  afterEach(() => {
    terraClient.purgeClient()
  })

  it('should perform an e2e test on LUNA testnet', async () => {
    try {
      terraClient.setNetwork('testnet' as Network)
      const xfer = {
        walletIndex: 0,
        asset: {
          chain: Chain.Terra,
          symbol: 'LUNA',
          ticker: 'LUNA',
        },
        amount: baseAmount('100000'), // 0.1 LUNA
        recipient: terraClient.getAddress(1),
        memo: 'memo test',
      }
      // let txHash = await terraClient.transfer(xfer)
      xfer
      // now fetch the tx details
      const txHash = 'A24E754107E4BADEA11DCCCBA4E36E03C7068620592C53DFA5454E7DF5488868'
      const txDetails = await terraClient.getTransactionData(txHash)
      console.log(txDetails)
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get LUNA transaction details', async () => {
    try {
      terraClient.setNetwork('testnet' as Network)

      const txHash = '5C2810ECB4C3F2A25FADD5A6806E7D5CFC37B59F4F72D69D8A25061E355437E0'
      const txDetails = await terraClient.getTransactionData(txHash)
      expect(txDetails.asset.ticker).toEqual('LUNA')
      expect(txDetails.asset.symbol).toEqual('LUNA')
      expect(txDetails.from[0].from).toEqual('terra1h6t6a8fkzcklgrdql4avpsyk7whak5umxmmek0')
      expect(txDetails.from[0].amount.amount().toFixed()).toEqual('100000')
      expect(txDetails.to[0].to).toEqual('terra13zeuy5c6hrcwv2u7a73jket2ujhf5e5us4m956')
      expect(txDetails.to[0].amount.amount().toFixed()).toEqual('100000')
      expect(txDetails.type).toEqual('transfer')
      expect(txDetails.hash).toEqual('5C2810ECB4C3F2A25FADD5A6806E7D5CFC37B59F4F72D69D8A25061E355437E0')
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get UST transaction details', async () => {
    try {
      terraClient.setNetwork('testnet' as Network)

      const txHash = 'A8057659C5F189B91E3D85794479D80A78B5A4F6D4C5E6CAC01A3FADB274332F'
      const txDetails = await terraClient.getTransactionData(txHash)
      expect(txDetails.asset.ticker).toEqual('UST')
      expect(txDetails.asset.symbol).toEqual('UST')
      expect(txDetails.from[0].from).toEqual('terra1k7lduqpzvwgc5vfhg5de8adrq4yvhalnehctf8')
      expect(txDetails.from[0].amount.amount().toFixed()).toEqual('300000000')
      expect(txDetails.to[0].to).toEqual('terra1u8j37e8l82ucthx574njxmuyqane2y9h0ewwxf')
      expect(txDetails.to[0].amount.amount().toFixed()).toEqual('300000000')
      expect(txDetails.type).toEqual('transfer')
      expect(txDetails.hash).toEqual('A8057659C5F189B91E3D85794479D80A78B5A4F6D4C5E6CAC01A3FADB274332F')
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get address balances', async () => {
    try {
      terraClient.setNetwork('testnet' as Network)

      const address = 'terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv'
      const balances = await terraClient.getBalance(address)
      balances.forEach((bal: Balance) => {
        console.log(`${baseToAsset(bal.amount).amount().toFixed()} ${bal.asset.symbol}`)
      })
      // expect(txDetails.asset.ticker).toEqual('UST')
      // expect(txDetails.asset.symbol).toEqual('UST')
      // expect(txDetails.from[0].from).toEqual('terra1k7lduqpzvwgc5vfhg5de8adrq4yvhalnehctf8')
      // expect(txDetails.from[0].amount.amount().toFixed()).toEqual('300000000')
      // expect(txDetails.to[0].to).toEqual('terra1u8j37e8l82ucthx574njxmuyqane2y9h0ewwxf')
      // expect(txDetails.to[0].amount.amount().toFixed()).toEqual('300000000')
      // expect(txDetails.type).toEqual('transfer')
      // expect(txDetails.hash).toEqual('A8057659C5F189B91E3D85794479D80A78B5A4F6D4C5E6CAC01A3FADB274332F')
    } catch (error) {
      console.error(error)
      fail()
    }
  })

  // it('should transfer UST with a memo', async () => {
  //   try {
  //     terraClient.setNetwork('testnet' as Network)
  //     const recipient = terraClient.getAddress(1)
  //     const result = await terraClient.transfer({
  //       walletIndex: 0,
  //       asset: {
  //         chain: Chain.Terra,
  //         symbol: 'UST',
  //         ticker: 'UST',
  //       },
  //       amount: baseAmount('10000'), // 0.01 UST
  //       recipient,
  //       memo: 'memo test',
  //     })
  //     expect(result).toEqual('xxx')
  //   } catch (error) {
  //     console.error(error)
  //   }
  // })
})
