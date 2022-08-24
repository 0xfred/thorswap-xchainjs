import { ClientTxParams, Network } from '@thorswap-lib/types'

import { UTXO } from './common'

export type LedgerTxInfo = {
  utxos: UTXO[]
  newTxHex: string
}

export type LedgerTxInfoParams = Pick<ClientTxParams, 'amount' | 'recipient'> & {
  feeRate: number
  sender: string
  network: Network
  sochainUrl: string
  nodeApiKey: string
}
