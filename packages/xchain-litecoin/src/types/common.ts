import { Network } from '@thorswap-lib/xchain-client'

export type Witness = {
  value: number
  script: Buffer
}
export type UTXO = {
  hash: string
  index: number
  value: number
  witnessUtxo: Witness
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
