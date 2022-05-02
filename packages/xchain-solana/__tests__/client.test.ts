import { Network } from '@thorswap-lib/xchain-client'

import { Client } from '../src/client'

describe('Solana Client Test', () => {
  let solanaClient: Client
  const phrase = 'neither lonely flavor argue grass remind eye tag avocado spot unusual intact'

  const addressPath0 = 'DsgX3wpzzaZwuEUAZVMtg52sgywkXf7mUCHodzX2YJef'
  const addressPath1 = 'BwHaUs8x7mrbGuH5WbAJTDk1vZKzhewDy9TJzE381z3r'

  beforeEach(() => {
    solanaClient = new Client({ network: Network.Testnet, phrase })
  })
  it('should output the correct address', () => {
    const testAddress0 = solanaClient.getAddress(0)
    expect(testAddress0).toEqual(addressPath0)
    const testAddress1 = solanaClient.getAddress(1)
    expect(testAddress1).toEqual(addressPath1)
  })

  it('should get the correct balance', async () => {
    const address = solanaClient.getAddress(0)
    await solanaClient.requestAirdrop(address)
    const balance = await solanaClient.getBalance(address)
    expect(balance[0].amount.amount().toNumber()).toBeGreaterThan(0)
  })
})
