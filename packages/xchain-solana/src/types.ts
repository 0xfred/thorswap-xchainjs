import { Connection, PublicKey } from '@solana/web3.js'
import { BaseAmount } from '@thorswap-lib/xchain-util/lib'

export interface SPLTokenTransferParams {
  tokenMintAddress: string
  from: PublicKey
  recipient: string
  connection: Connection
  amount: BaseAmount
  decimals: number
}
