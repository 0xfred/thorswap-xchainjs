import { Keypair } from '@solana/web3.js'
import {
  Balance,
  BaseXChainClient,
  Fees,
  Network,
  Tx,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@thorswap-lib/xchain-client'
import { getSeed } from '@thorswap-lib/xchain-crypto'
import { Chain } from '@thorswap-lib/xchain-util'
import { derivePath } from 'ed25519-hd-key'

/**
 * Solana Client
 */
class Client extends BaseXChainClient implements XChainClient {
  constructor({
    network = Network.Testnet,
    phrase,
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/501'/0'/1'/`,
      [Network.Testnet]: `m/44'/501'/0'/1'/`,
    },
  }: XChainClientParams) {
    super(Chain.Solana, { network, phrase, rootDerivationPaths })
  }
  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(index = 0): string {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    const seed = getSeed(this.phrase)
    const keypair = Keypair.fromSeed(derivePath(this.getFullDerivationPath(index), seed.toString('hex')).key)
    return keypair.publicKey.toBase58()
  }
  getExplorerUrl(): string {
    throw new Error('Method not implemented.')
  }
  getExplorerAddressUrl(): string {
    throw new Error('Method not implemented.')
  }
  getExplorerTxUrl(): string {
    throw new Error('Method not implemented.')
  }
  validateAddress(): boolean {
    throw new Error('Method not implemented.')
  }
  getBalance(): Promise<Balance[]> {
    throw new Error('Method not implemented.')
  }
  getTransactions(): Promise<TxsPage> {
    throw new Error('Method not implemented.')
  }
  getTransactionData(): Promise<Tx> {
    throw new Error('Method not implemented.')
  }
  transfer(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  protected getFullDerivationPath(walletIndex: number): string {
    return `${super.getFullDerivationPath(walletIndex)}'`
  }
}

export { Client }
