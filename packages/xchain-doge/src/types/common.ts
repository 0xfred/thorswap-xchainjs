import { FeeRates, Fees, Network } from '@thorswap-lib/types'

export type UTXO = {
  hash: string
  index: number
  value: number
  txHex?: string
}

export type NodeAuth = {
  username: string
  password: string
}

export type BroadcastTxParams = {
  network: Network
  txHex: string
  nodeUrl: string
  auth?: NodeAuth
}

export type FeesWithRates = {
  rates: FeeRates
  fees: Fees
}
