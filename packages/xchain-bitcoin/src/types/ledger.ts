import { Address, FeeRate, Network, TxParams } from '@thorswap/xchain-client'
import { OnlyRequired } from '@thorswap/xchain-util'

import { UTXO } from './common'

export type LedgerTxInfo = {
  utxos: UTXO[]
  newTxHex: string
}

export type LedgerTxInfoParams = OnlyRequired<TxParams> & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
}
