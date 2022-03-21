# `@thorswap-lib/xchain-thorchain`

Thorchain Module for XChainJS Clients

## Installation

```
yarn add @thorswap-lib/xchain-thorchain
```

Following peer dependencies have to be installed into your project. These are not included in `@thorswap-lib/xchain-thorchain`.

```
yarn add @thorswap-lib/xchain-client @thorswap-lib/xchain-crypto @thorswap-lib/xchain-util @thorswap-lib/xchain-cosmos axios cosmos-client bech32-buffer
```

Important note: Make sure to install same version of `cosmos-client` as `xchain-thorchain` is using (currently `cosmos-client@0.44.4` ). In other case things might break.

## Thorchain Client Testing

```
yarn install
yarn test
```

## Service Providers

This package uses the following service providers:

| Function                    | Service        | Notes                                                               |
| --------------------------- | -------------- | ------------------------------------------------------------------- |
| Balances                    | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /bank/balances/{address}`) |
| Transaction history         | Tendermint RPC | https://docs.tendermint.com/master/rpc/#/Info/tx_search             |
| Transaction details by hash | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /txs/{hash}`)              |
| Transaction broadcast       | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`POST /txs`)                    |
| Explorer                    | Thorchain.net  | https://thorchain.net                                               |

Rate limits: No

## Examples

```ts
// import `xchain-thorchain`
import { Client } from '@thorswap-lib/xchain-thorchain'

// Note: `chainIds` are required
const chainIds = getChainIds(getDefaultClientUrl()) // instead of `getDefaultClientUrl` you can pass custom API endpoints
const client = new Client({ network: Network.Testnet, phrase: 'my secret phrase', chainIds })

// get address
const address = client.getAddress()
console.log('address:', address) // address: tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg

// get private key
const privKey = client.getPrivKey()
console.log('privKey:', privKey.toBase64()) // privKey: {your-private-key} base64 encoded
console.log('privKey:', privKey.toBuffer()) // privKey: {your-private-key} as `Buffer`

// get public key
const pubKey = client.getPubKey()
console.log('pubKey:', pubKey.toBase64()) // pubKey: {your-public-key} base64 encoded
console.log('pubKey:', pubKey.toBuffer()) // pubKey: {your-public-key} as `Buffer`

// get balances
const balances = await client.getBalance(address)
console.log('balances:', balances[0].amount.amount().toString()) // balance: 6968080395099

// get transactions
const txs = await client.getTransactions({ address })
console.log('txs total:', txs.total) // txs total: 100

// get transaction details
const tx = await client.getTransactionData('any-tx-hash', address)
console.log('tx asset:', tx.asset) // tx asset: { chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE' }
```

For more examples check out tests in `./__tests__/client.test.ts`

## Creating protobuffer typescript bindings

In order for this library to de/serialize proto3 structures, you can use the following to create bindings

1. `git clone https://gitlab.com/thorchain/thornode`
2. run the following (adjust the paths acordingly) to generate a typecript file for MsgDeposit

   ```bash
   yarn run pbjs -w commonjs  -t static-module  <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto <path to repo>/thornode/proto/thorchain/v1/common/common.proto -o src/types/MsgDeposit.js
   ```

3. run the following to generate the .d.ts file

   ```bash
   yarn run pbts -o src/types/MsgDeposit.d.ts src/types/MsgDeposit.js
   ```

Alternatively, you can run the convenience script: `genMsgs.sh`, which will overwrite the proto/js files in types/proto. This should only be done and checked in if changes were made to the upstream Msg in the THORNode repo.
