import { Network } from '@thorswap-lib/types'

export type NormalTxParams = { addressTo: string; amount: number; feeRate: number }
export type VaultTxParams = NormalTxParams & { memo: string }

export type GetChangeParams = {
  valueOut: number
  sochainUrl: string
  network: Network
  address: string
}
