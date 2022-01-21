import { Network } from '@thorswap-lib/xchain-client'

export type UTXO = {
  hash: string
  index: number
  value: number
  txHex?: string
}

export type BroadcastTxParams = {
  network: Network
  txHex: string
  nodeUrl: string
}
