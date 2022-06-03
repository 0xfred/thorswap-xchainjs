import { TokenAccountNotFoundError, getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { Address, Balance, Network } from '@thorswap-lib/xchain-client'
import {
  Asset,
  AssetSolana,
  AssetUSDCSPL,
  Chain,
  USDC_SPL_MINT_ADDRESS,
  USDC_SPL_TESTNET_MINT_ADDRESS,
  USDC_TICKER,
  baseAmount,
} from '@thorswap-lib/xchain-util'

import { SOLANA_DECIMAL, USDC_SPL_DECIMAL } from './const'

export const getSOLBalance = async (connection: Connection, address: Address): Promise<Balance> => {
  const balance = await connection.getBalance(new PublicKey(address))
  return {
    asset: AssetSolana,
    amount: baseAmount(balance, SOLANA_DECIMAL),
  }
}

export const getUSDCSPLBalance = async (
  network: Network,
  connection: Connection,
  address: Address,
): Promise<Balance | undefined> => {
  try {
    const mintAddress = network === Network.Mainnet ? USDC_SPL_MINT_ADDRESS : USDC_SPL_TESTNET_MINT_ADDRESS
    const mintPublicKey = new PublicKey(mintAddress)
    const userSPLAddress = await getAssociatedTokenAddress(mintPublicKey, new PublicKey(address))
    const { amount } = await getAccount(connection, userSPLAddress)
    return {
      asset: AssetUSDCSPL,
      amount: baseAmount(Number(amount), USDC_SPL_DECIMAL),
    }
  } catch (e) {
    if (!(e instanceof TokenAccountNotFoundError)) {
      throw e
    }
  }

  return undefined
}

export const isSOLAsset = (asset: Asset) =>
  asset.chain === Chain.Solana && asset.symbol === 'SOL' && asset.ticker === 'SOL'

export const isUSDCSPLAsset = (asset: Asset) =>
  asset.chain === Chain.Solana && asset.symbol.startsWith(USDC_TICKER) && asset.ticker === USDC_TICKER
