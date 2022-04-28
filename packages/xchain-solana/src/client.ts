import { Balance, BaseXChainClient, Fees, Tx, TxsPage, XChainClient } from '@thorswap-lib/xchain-client'

/**
 * Solana Client
 */
class Client extends BaseXChainClient implements XChainClient {
  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(): string {
    throw new Error('Method not implemented.')
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
}

export { Client }
