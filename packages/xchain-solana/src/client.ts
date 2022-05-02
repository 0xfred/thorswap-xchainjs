import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
  Address,
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
import { AssetSolana, Chain, baseAmount } from '@thorswap-lib/xchain-util'
import { derivePath } from 'ed25519-hd-key'

export type SolanaClientParams = XChainClientParams & {
  nodeUrl?: string
}

export const SOLANA_DECIMAL = 9

/**
 * Solana Client
 */
class Client extends BaseXChainClient implements XChainClient {
  public nodeUrl: string
  constructor({
    nodeUrl,
    network = Network.Testnet,
    phrase,
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/501'/0'/1'/`,
      [Network.Testnet]: `m/44'/501'/0'/1'/`,
    },
  }: SolanaClientParams) {
    super(Chain.Solana, { network, phrase, rootDerivationPaths })
    this.nodeUrl =
      nodeUrl ??
      (() => {
        switch (network) {
          case Network.Mainnet:
            return 'https://ssc-dao.genesysgo.net'
          case Network.Testnet:
            return clusterApiUrl('devnet')
        }
      })()
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

  async getBalance(address: Address): Promise<Balance[]> {
    const connection = new Connection(this.nodeUrl, 'confirmed')
    const balance = await connection.getBalance(new PublicKey(address))
    const amount = baseAmount(balance / LAMPORTS_PER_SOL, SOLANA_DECIMAL)

    return [
      {
        asset: AssetSolana,
        amount,
      },
    ]
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

  async requestAirdrop(address: Address) {
    if (this.network !== Network.Testnet) {
      throw Error('Airdrops are only available in Testnet')
    }
    const connection = new Connection(this.nodeUrl, 'confirmed')
    const airdropSignature = await connection.requestAirdrop(new PublicKey(address), 1 * LAMPORTS_PER_SOL)
    await connection.confirmTransaction(airdropSignature)
  }

  protected getFullDerivationPath(walletIndex: number): string {
    return `${super.getFullDerivationPath(walletIndex)}'`
  }
}

export { Client }
