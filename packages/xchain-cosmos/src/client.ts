import { proto } from '@cosmos-client/core'
import {
  Address,
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  PrivateKeyCache,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@thorswap-lib/xchain-client'
import { Asset, AssetAtom, AssetMuon, Chain, assetToString, baseAmount, deepEqual } from '@thorswap-lib/xchain-util'

import { CosmosSDKClient } from './cosmos/sdk-client'
import { TxOfflineParams, TxResponse } from './cosmos/types'
import { DECIMAL, getAsset, getDenom, getTxsFromHistory } from './util'

/**
 * Interface for custom Cosmos client
 */
export interface CosmosClient {
  getMainAsset(): Asset
  getSDKClient(): CosmosSDKClient
}

export interface CosmosClientParams extends XChainClientParams {
  serverUrl?: string
  privateKeyInit?: PrivateKeyCache<proto.cosmos.crypto.secp256k1.PrivKey>
}

const MAINNET_SDK = (serverUrl: string | undefined) =>
  new CosmosSDKClient({
    server: serverUrl || 'https://api.cosmos.network',
    chainId: 'cosmoshub-4',
  })
const TESTNET_SDK = () =>
  new CosmosSDKClient({
    server: 'https://rest.sentry-02.theta-testnet.polypore.xyz',
    chainId: 'theta-testnet-001',
  })

/**
 * Custom Cosmos client
 */
class Client extends BaseXChainClient implements CosmosClient, XChainClient {
  private sdkClients: Map<Network, CosmosSDKClient> = new Map<Network, CosmosSDKClient>()
  private privateKeyCache: PrivateKeyCache<proto.cosmos.crypto.secp256k1.PrivKey> | undefined
  /**
   * Constructor
   *
   * Client has to be initialised with network type and phrase.
   * It will throw an error if an invalid phrase has been passed.
   *
   * @param {XChainClientParams} params
   *
   * @throws {"Invalid phrase"} Thrown if the given phase is invalid.
   */
  constructor({
    network = Network.Testnet,
    phrase,
    rootDerivationPaths = {
      [Network.Mainnet]: `44'/118'/0'/0/`,
      [Network.Testnet]: `44'/118'/0'/0/`,
    },
    serverUrl,
    privateKeyInit,
  }: CosmosClientParams) {
    super(Chain.Cosmos, { network, rootDerivationPaths, phrase })
    this.sdkClients.set(Network.Testnet, TESTNET_SDK())
    this.sdkClients.set(Network.Mainnet, MAINNET_SDK(serverUrl))
    this.privateKeyCache = privateKeyInit
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
        return 'https://cosmos.bigdipper.live'
      case Network.Testnet:
        return 'https://explorer.theta-testnet.polypore.xyz'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  /**
   * @private
   * Get private key and update instance value of it
   *
   * @returns {PrivKey} The private key generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   * */
  private getPrivateKey(index = 0): proto.cosmos.crypto.secp256k1.PrivKey {
    if (
      this.privateKeyCache &&
      deepEqual(this.privateKeyCache, {
        index,
        phrase: this.phrase,
        network: this.network,
        privateKey: this.privateKeyCache.privateKey,
      })
    )
      return this.privateKeyCache.privateKey

    if (!this.phrase) throw new Error('Phrase not set')

    const privateKey = this.createPrivateKey(this.phrase, index)

    this.privateKeyCache = {
      network: this.network,
      phrase: this.phrase,
      index,
      privateKey,
    }

    return privateKey
  }

  /**
   * Create private key
   *
   * @param {number} index the HD wallet index (optional)
   * @returns {PrivKey} The private key generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   * */
  createPrivateKey(phrase: string, index = 0): proto.cosmos.crypto.secp256k1.PrivKey {
    return this.getSDKClient().getPrivKeyFromMnemonic(phrase, this.getFullDerivationPath(index))
  }

  getSDKClient(): CosmosSDKClient {
    return this.sdkClients.get(this.network) || TESTNET_SDK()
  }

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress(index = 0): string {
    if (!this.phrase) throw new Error('Phrase not set')

    return this.getSDKClient().getAddressFromMnemonic(this.phrase, this.getFullDerivationPath(index))
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: Address): boolean {
    return this.getSDKClient().checkAddress(address)
  }

  /**
   * Get the main asset based on the network.
   *
   * @returns {Asset} The main asset based on the network.
   */
  getMainAsset(): Asset {
    switch (this.network) {
      case Network.Mainnet:
        return AssetAtom
      case Network.Testnet:
        return AssetMuon
    }
  }

  /**
   * Get the balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @param {Asset} asset If not set, it will return all assets available. (optional)
   * @returns {Balance[]} The balance of the address.
   */
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const balances = await this.getSDKClient().getBalance(address)
    return balances
      .filter((balance) => balance.denom && getAsset(balance.denom))
      .map((balance) => {
        return {
          asset: getAsset(balance.denom) as Asset,
          amount: baseAmount(balance.amount, DECIMAL),
        }
      })
      .filter(
        (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
      )
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const messageAction = undefined
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    const mainAsset = this.getMainAsset()
    const txHistory = await this.getSDKClient().searchTx({
      messageAction,
      messageSender: (params && params.address) || this.getAddress(),
      page,
      limit,
      txMinHeight,
      txMaxHeight,
    })

    return {
      total: parseInt(txHistory.pagination?.total || '0'),
      txs: getTxsFromHistory(txHistory.tx_responses || [], mainAsset),
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    const txResult = await this.getSDKClient().txsHashGet(txId)

    if (!txResult || txResult.txhash === '') {
      throw new Error('transaction not found')
    }

    const txResult2: TxResponse = {
      ...txResult,
      tx: txResult.tx
        ? {
            body: {
              messages: txResult.tx.body.messages.map((message) => proto.google.protobuf.Any.fromObject(message)),
            },
          }
        : undefined,
    }
    const txs = getTxsFromHistory([txResult2], this.getMainAsset())
    if (txs.length === 0) throw new Error('transaction not found')

    return txs[0]
  }

  /**
   * Transfer balances.
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer({ walletIndex, asset, amount, recipient, memo }: TxParams): Promise<TxHash> {
    const fromAddressIndex = walletIndex || 0

    const mainAsset = this.getMainAsset()
    return this.getSDKClient().transfer({
      privkey: this.getPrivateKey(fromAddressIndex),
      from: this.getAddress(fromAddressIndex),
      to: recipient,
      amount: amount.amount().toString(),
      asset: getDenom(asset || mainAsset),
      memo,
    })
  }

  /**
   * Transfer offline balances.
   *
   * @param {TxOfflineParams} params The transfer offline options.
   * @returns {string} The signed transaction bytes.
   */
  async transferOffline({
    walletIndex,
    asset,
    amount,
    recipient,
    memo,
    from_account_number,
    from_sequence,
  }: TxOfflineParams): Promise<string> {
    const fromAddressIndex = walletIndex || 0

    const mainAsset = this.getMainAsset()
    return await this.getSDKClient().transferSignedOffline({
      privkey: this.getPrivateKey(fromAddressIndex),
      from: this.getAddress(fromAddressIndex),
      from_account_number,
      from_sequence,
      to: recipient,
      amount: amount.amount().toString(),
      asset: getDenom(asset || mainAsset),
      memo,
    })
  }

  /**
   * Get the current fee.
   *
   * @returns {Fees} The current fee.
   */
  async getFees(): Promise<Fees> {
    // there is no fixed fee, we set fee amount when creating a transaction.
    return {
      type: FeeType.FlatFee,
      fast: baseAmount(750, DECIMAL),
      fastest: baseAmount(2500, DECIMAL),
      average: baseAmount(0, DECIMAL),
    }
  }
}

export { Client }
