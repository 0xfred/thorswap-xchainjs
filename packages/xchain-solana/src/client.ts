import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedInstruction,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  Address,
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  Tx,
  TxHistoryParams,
  TxParams,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@thorswap-lib/xchain-client'
import { getSeed } from '@thorswap-lib/xchain-crypto'
import { AssetSolana, Chain, baseAmount } from '@thorswap-lib/xchain-util'
import { derivePath } from 'ed25519-hd-key'

const EXPLORER_URL = 'https://explorer.solana.com'

export const SOLANA_DECIMAL = 9

export type SolanaClientParams = XChainClientParams & {
  nodeUrl?: string
}

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
            return clusterApiUrl('testnet')
        }
      })()
  }

  async getFees(): Promise<Fees> {
    const connection = new Connection(this.nodeUrl, 'confirmed')
    const fromKeypair = this.getKeyPair()
    const to = this.getAddress(1)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(to),
        lamports: LAMPORTS_PER_SOL,
      }),
    )

    const blockHash = await connection.getLatestBlockhash()

    transaction.recentBlockhash = blockHash.blockhash
    transaction.feePayer = fromKeypair.publicKey

    const estimatedFee = await transaction.getEstimatedFee(connection)

    const fee = baseAmount(estimatedFee, SOLANA_DECIMAL)
    return singleFee(FeeType.FlatFee, fee)
  }

  getAddress(index = 0): string {
    const keypair = this.getKeyPair(index)
    return keypair.publicKey.toBase58()
  }

  getExplorerUrl(): string {
    return this.isTestnet() ? this.appendTestnetClusterParam(EXPLORER_URL) : EXPLORER_URL
  }

  getExplorerAddressUrl(address: string): string {
    const explorerAddressURL = `${EXPLORER_URL}/address/${address}`
    return this.isTestnet() ? this.appendTestnetClusterParam(explorerAddressURL) : explorerAddressURL
  }

  getExplorerTxUrl(txID: string): string {
    const explorerTxURL = `${EXPLORER_URL}/tx/${txID}`
    return this.isTestnet() ? this.appendTestnetClusterParam(explorerTxURL) : explorerTxURL
  }

  validateAddress(address: string): boolean {
    try {
      const pubkey = new PublicKey(address)
      const isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
      return isSolana
    } catch (error) {
      return false
    }
  }

  async getBalance(address: Address): Promise<Balance[]> {
    const connection = new Connection(this.nodeUrl, 'confirmed')
    const balance = await connection.getBalance(new PublicKey(address))
    const amount = baseAmount(balance, SOLANA_DECIMAL)

    return [
      {
        asset: AssetSolana,
        amount,
      },
    ]
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    if (!params?.address) throw new Error('Address not provided')
    const connection = new Connection(this.nodeUrl, 'confirmed')

    const signatures = await connection.getSignaturesForAddress(new PublicKey(params.address), { limit: params.limit })
    const parsedTransactions = await connection.getParsedTransactions(
      signatures.map((signature) => signature.signature),
    )

    const transactions: Tx[] = []
    parsedTransactions
      .filter((parsedTransaction) => parsedTransaction !== null)
      .forEach((parsedTransaction, i) => {
        const date = parsedTransaction?.blockTime ? new Date(parsedTransaction.blockTime * 1000) : new Date()
        parsedTransaction?.transaction.message.instructions
          .filter((instruction) => (instruction as ParsedInstruction).parsed.type === 'transfer')
          .forEach((instruction) => {
            const parsedInstructionInformation = (instruction as ParsedInstruction).parsed.info
            transactions.push({
              asset: AssetSolana,
              from: [
                {
                  from: parsedInstructionInformation.source,
                  amount: baseAmount(parsedInstructionInformation.lamports, SOLANA_DECIMAL),
                },
              ],
              to: [
                {
                  to: parsedInstructionInformation.destination,
                  amount: baseAmount(parsedInstructionInformation.lamports, SOLANA_DECIMAL),
                },
              ],
              date,
              type: TxType.Transfer,
              hash: signatures[i].signature,
            })
          })
      })
    return { total: transactions.length, txs: transactions }
  }

  async getTransactionData(hash: string): Promise<Tx> {
    const connection = new Connection(this.nodeUrl, 'confirmed')

    const parsedTransaction = await connection.getParsedTransaction(hash)

    if (!parsedTransaction) throw new Error(`Failed to get transaction ${hash}`)

    const date = parsedTransaction?.blockTime ? new Date(parsedTransaction.blockTime * 1000) : new Date()

    const instruction = (parsedTransaction?.transaction.message.instructions[0] as ParsedInstruction).parsed

    return {
      hash,
      asset: AssetSolana,
      date,
      from: instruction.info.source,
      to: instruction.info.destination,
      type: instruction.type,
    }
  }

  async transfer({ walletIndex = 0, amount, recipient }: TxParams): Promise<string> {
    if (!this.validateAddress(recipient)) throw new Error(`${recipient} is not a valid Solana address`)

    const fromKeypair = this.getKeyPair(walletIndex)
    const lamportsToSend = amount.amount().toNumber()
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: lamportsToSend,
      }),
    )

    const connection = new Connection(this.nodeUrl, 'confirmed')

    const blockHash = await connection.getLatestBlockhash()

    transaction.recentBlockhash = blockHash.blockhash
    transaction.feePayer = fromKeypair.publicKey

    return sendAndConfirmTransaction(connection, transaction, [fromKeypair])
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

  private appendTestnetClusterParam(url: string) {
    return `${url}?cluster=testnet`
  }

  private isTestnet() {
    return this.network === Network.Testnet
  }

  private getKeyPair(index = 0) {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    const seed = getSeed(this.phrase)
    const keypair = Keypair.fromSeed(derivePath(this.getFullDerivationPath(index), seed.toString('hex')).key)

    return keypair
  }
}

export { Client }
