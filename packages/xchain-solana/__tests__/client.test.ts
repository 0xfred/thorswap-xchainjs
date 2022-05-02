import { Network } from '@thorswap-lib/xchain-client'

import { Client } from '../src/client'

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
})
