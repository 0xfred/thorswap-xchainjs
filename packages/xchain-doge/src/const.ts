import { Chain } from '@thorswap-lib/types'

/**
 * Minimum transaction fee
 * 100000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/dogecoin/dogecoin/blob/master/src/validation.h#L58
 */
export const MIN_TX_FEE = 100000

export const AssetDoge = { chain: Chain.Doge, symbol: 'DOGE', ticker: 'DOGE' }
