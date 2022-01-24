import { Asset, Chain } from '@thorswap-lib/xchain-util/lib'

export const isLunaAsset = (asset: Asset) => {
  return asset.chain === Chain.Terra && asset.symbol === 'LUNA' && asset.ticker === 'LUNA'
}

export const isUSTAsset = (asset: Asset) => {
  return asset.chain === Chain.Terra && asset.symbol === 'UST' && asset.ticker === 'UST'
}
