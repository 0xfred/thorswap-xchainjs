import { assetAmount, assetToBase } from '@thorswap-lib/atlas'
import {
  AmountWithBaseDenom,
  Balance,
  Chain,
  ClientTxParams,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxType,
  TxsPage,
} from '@thorswap-lib/types'
import { PrivateKeyCache, UTXOClient, XChainClientParams } from '@thorswap-lib/xchain-client'
import { getSeed } from '@thorswap-lib/xchain-crypto'
import { fromSeed } from 'bip32'
import { payments } from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import deepEqual from 'fast-deep-equal'
import * as tinySecp from 'tiny-secp256k1'

import { AssetDoge } from './const'
import * as sochain from './sochain-api'
import { NodeAuth } from './types'
import { TxIO } from './types/sochain-api-types'
import * as Utils from './utils'

export type DogecoinClientParams = XChainClientParams & {
  sochainUrl?: string
  nodeUrl?: string
  nodeAuth?: NodeAuth | null
  apiKey?: string | null
  privateKeyInit?: PrivateKeyCache<ECPairInterface>
}

/**
 * Custom Dogecoin client
 */
class Client extends UTXOClient {
  private sochainUrl = ''
  public nodeUrl = ''
  public nodeAuth?: NodeAuth
  private apiKey: string | null = null
  private privateKeyCache: PrivateKeyCache<ECPairInterface> | undefined

  /**
   * Constructor
   * Client is initialised with network type
   * Pass strict null as nodeAuth to disable auth for node json rpc
   *
   * @param {DogecoinClientParams} params
   */
  constructor({
    network = Network.Testnet,
    sochainUrl = 'https://sochain.com/api/v2',
    phrase,
    nodeUrl,
    nodeAuth = {
      username: 'thorchain',
      password: 'password',
    },
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/3'/0'/0/`,
      [Network.Testnet]: `m/44'/1'/0'/0/`,
    },
    apiKey = null,
    privateKeyInit,
  }: DogecoinClientParams) {
    super(Chain.Doge, { network, rootDerivationPaths, phrase })
    this.nodeUrl =
      nodeUrl || network === Network.Mainnet ? 'https://doge.thorchain.info' : 'https://testnet.doge.thorchain.info'

    // set apiKey
    this.apiKey = apiKey

    this.nodeAuth =
      // Leave possibility to send requests without auth info for user
      // by strictly passing nodeAuth as null value
      nodeAuth === null ? undefined : nodeAuth

    this.setSochainUrl(sochainUrl)
    this.privateKeyCache = privateKeyInit
  }

  /**
   * Set/Update the sochain url.
   *
   * @param {string} url The new sochain url.
   * @returns {void}
   */
  setSochainUrl(url: string): void {
    this.sochainUrl = url
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Testnet:
        return 'https://blockexplorer.one/dogecoin/testnet'
      default:
        return 'https://blockchair.com/dogecoin'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: string): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    switch (this.network) {
      case Network.Testnet:
        return `${this.getExplorerUrl()}/tx/${txID}`
      default:
        return `${this.getExplorerUrl()}/transaction/${txID}`
    }
  }

  /**
   * Get the current address.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   *
   * @returns {Address} The current address.
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  getAddress(index = 0): string {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const dogeNetwork = Utils.dogeNetwork(this.network)
      const dogeKeys = this.getDogeKeys(this.phrase, index)

      const { address } = payments.p2pkh({
        pubkey: dogeKeys.publicKey,
        network: dogeNetwork,
      })

      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
  }

  /**
   * @private
   * Get private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase to be used for generating privkey
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating Doge keys from the given phrase
   * */
  private getDogeKeys(phrase: string, index = 0): ECPairInterface {
    if (
      this.privateKeyCache &&
      deepEqual(this.privateKeyCache, {
        index,
        phrase: phrase,
        network: this.network,
        privateKey: this.privateKeyCache.privateKey,
      })
    )
      return this.privateKeyCache.privateKey

    const privateKey = this.createBtcKeys(phrase, index)

    this.privateKeyCache = {
      network: this.network,
      index,
      phrase,
      privateKey,
    }

    return privateKey
  }

  /**
   * creates DOGE keys from phrase and index
   *
   * @param {string} phrase The phrase to be used for generating privkey
   * @param {number} index The phrase to be used for generating privkey
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating BTC keys from the given phrase
   */
  createBtcKeys(phrase: string, index = 0): ECPairInterface {
    const dogeNetwork = Utils.dogeNetwork(this.network)
    const seed = getSeed(phrase)
    const master = fromSeed(seed, dogeNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPairFactory(tinySecp).fromPrivateKey(master.privateKey, { network: dogeNetwork })
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Get the Doge balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The Doge balance of the address.
   */
  async getBalance(address: string): Promise<Balance[]> {
    return Utils.getBalance({
      sochainUrl: this.sochainUrl,
      network: this.network,
      address,
    })
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    // Sochain API doesn't have pagination parameter
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    const response = await sochain.getAddress({
      sochainUrl: this.sochainUrl,
      network: this.network,
      address: `${params?.address}`,
    })
    const total = response.txs.length
    const transactions: Tx[] = []

    const txs = response.txs.filter((_, index) => offset <= index && index < offset + limit)
    for (const txItem of txs) {
      const rawTx = await sochain.getTx({
        sochainUrl: this.sochainUrl,
        network: this.network,
        hash: txItem.txid,
      })
      const tx: Tx = {
        asset: AssetDoge,
        from: rawTx.inputs.map((i: TxIO) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, Utils.DOGE_DECIMAL)),
        })),
        to: rawTx.outputs
          // ignore tx with type 'nulldata'
          .filter((i: TxIO) => i.type !== 'nulldata')
          .map((i: TxIO) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.DOGE_DECIMAL)) })),
        date: new Date(rawTx.time * 1000),
        type: TxType.Transfer,
        hash: rawTx.txid,
      }
      transactions.push(tx)
    }

    const result: TxsPage = {
      total,
      txs: transactions,
    }
    return result
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    const rawTx = await sochain.getTx({
      sochainUrl: this.sochainUrl,
      network: this.network,
      hash: txId,
    })
    return {
      asset: AssetDoge,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: assetToBase(assetAmount(i.value, Utils.DOGE_DECIMAL)),
      })),
      to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.DOGE_DECIMAL)) })),
      date: new Date(rawTx.time * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  protected async getSuggestedFeeRate(): Promise<number> {
    return await sochain.getSuggestedTxFee()
  }

  protected async calcFee(feeRate: number, memo?: string): Promise<AmountWithBaseDenom> {
    return Utils.calcFee(feeRate, memo)
  }

  /**
   * Transfer Doge.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: ClientTxParams & { feeRate?: number }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getSuggestedFeeRate())
    const { psbt } = await Utils.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      sochainUrl: this.sochainUrl,
      network: this.network,
    })
    const dogeKeys = this.getDogeKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(dogeKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({
      network: this.network,
      txHex,
      nodeUrl: sochain.getSendTxUrl({
        network: this.network,
        sochainUrl: this.sochainUrl,
        address: this.getAddress(fromAddressIndex),
        token: this.apiKey,
      }),
      // TODO: Check this before production
      // nodeUrl: this.nodeUrl,
      // auth: this.nodeAuth,
    })
  }
}

export { Client }
