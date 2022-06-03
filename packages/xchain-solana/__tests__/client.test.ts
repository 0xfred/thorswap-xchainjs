import { Network } from '@thorswap-lib/xchain-client'
import { AssetSolana, baseAmount } from '@thorswap-lib/xchain-util'

import { Client } from '../src/client'
import { SOLANA_DECIMAL } from '../src/const'

describe('Solana Client Test', () => {
  let solanaTestnetClient: Client
  let solanaMainnetClient: Client
  const phrase = 'neither lonely flavor argue grass remind eye tag avocado spot unusual intact'

  const addressPath0 = 'DsgX3wpzzaZwuEUAZVMtg52sgywkXf7mUCHodzX2YJef'
  const addressPath1 = 'BwHaUs8x7mrbGuH5WbAJTDk1vZKzhewDy9TJzE381z3r'

  beforeEach(() => {
    solanaTestnetClient = new Client({ network: Network.Testnet, phrase })
    solanaMainnetClient = new Client({ network: Network.Mainnet, phrase })
  })
  it('Should output the correct address', () => {
    const testAddress0 = solanaTestnetClient.getAddress(0)
    expect(testAddress0).toEqual(addressPath0)
    const testAddress1 = solanaTestnetClient.getAddress(1)
    expect(testAddress1).toEqual(addressPath1)
  })

  it('Should get the correct balance', async () => {
    const address = solanaTestnetClient.getAddress(0)
    await solanaTestnetClient.requestAirdrop(address)
    const balance = await solanaTestnetClient.getBalance(address)
    expect(balance[0].amount.amount().toNumber()).toBeGreaterThan(0)
  })

  it('Should return the correct explorer URL', () => {
    const testnetExplorerURL = solanaTestnetClient.getExplorerUrl()
    const mainnetExplorerURL = solanaMainnetClient.getExplorerUrl()

    expect(testnetExplorerURL).toBe('https://explorer.solana.com?cluster=testnet')
    expect(mainnetExplorerURL).toBe('https://explorer.solana.com')
  })

  it('Should return the correct explorer address URL', () => {
    const address = 'address_1'
    const testnetExplorerAddressURL = solanaTestnetClient.getExplorerAddressUrl(address)
    const mainnetExplorerAddressURL = solanaMainnetClient.getExplorerAddressUrl(address)

    expect(testnetExplorerAddressURL).toBe(`https://explorer.solana.com/address/${address}?cluster=testnet`)
    expect(mainnetExplorerAddressURL).toBe(`https://explorer.solana.com/address/${address}`)
  })

  it('Should return the correct explorer transaction URL', () => {
    const txID = 'transaction_1'
    const testnetExplorerTxURL = solanaTestnetClient.getExplorerTxUrl(txID)
    const mainnetExplorerTxURL = solanaMainnetClient.getExplorerTxUrl(txID)

    expect(testnetExplorerTxURL).toBe(`https://explorer.solana.com/tx/${txID}?cluster=testnet`)
    expect(mainnetExplorerTxURL).toBe(`https://explorer.solana.com/tx/${txID}`)
  })

  it('Should properly validate a Solana address', () => {
    const address = solanaTestnetClient.getAddress(0)
    expect(solanaTestnetClient.validateAddress(address)).toBe(true)
    expect(solanaTestnetClient.validateAddress('This is not an address')).toBe(false)
  })

  it('Should return the transaction history', async () => {
    const transactions = await solanaTestnetClient.getTransactions({
      address: 'DsgX3wpzzaZwuEUAZVMtg52sgywkXf7mUCHodzX2YJef',
    })
    expect(transactions.total).toBeGreaterThan(0)
    expect(transactions.txs[0].asset).toEqual(AssetSolana)
    expect(transactions.txs[0].type).toEqual('transfer')
    expect(transactions.txs[0].to.length).toEqual(1)
    expect(transactions.txs[0].from.length).toEqual(1)
  })

  it('Should transfer SOL', async () => {
    const recipient = solanaTestnetClient.getAddress(1)
    const amount = baseAmount(1, SOLANA_DECIMAL)
    await solanaTestnetClient.transfer({ walletIndex: 0, amount, recipient })
    const [recipientBalance] = await solanaTestnetClient.getBalance(recipient)
    expect(recipientBalance.amount.amount().toNumber()).toBeGreaterThan(0)
  })

  it('Should return estimated fees', async () => {
    const fees = await solanaTestnetClient.getFees()
    expect(fees.average.amount().toNumber()).toEqual(fees.fast.amount().toNumber())
    expect(fees.fast.amount().toNumber()).toEqual(fees.fastest.amount().toNumber())
  })

  it('Should return transaction data', async () => {
    const toWalletIndex = 1
    const recipient = solanaTestnetClient.getAddress(toWalletIndex)
    const amount = baseAmount(1000, SOLANA_DECIMAL)
    const transactionHash = await solanaTestnetClient.transfer({ walletIndex: 0, amount, recipient })
    const transactionData = await solanaTestnetClient.getTransactionData(transactionHash)

    expect(transactionData.from).toEqual('DsgX3wpzzaZwuEUAZVMtg52sgywkXf7mUCHodzX2YJef')
    expect(transactionData.to).toEqual('BwHaUs8x7mrbGuH5WbAJTDk1vZKzhewDy9TJzE381z3r')
    expect(transactionData.asset).toEqual(AssetSolana)
    expect(transactionData.type).toEqual('transfer')
  })
})
