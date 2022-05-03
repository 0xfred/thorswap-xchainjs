# `@thorswap-lib/xchain-solana`

## Modules

- `client` - Custom client for communicating with Solana by using [`@solana/web3.js`](https://solana-labs.github.io/solana-web3.js)

## Installation

```
yarn add @thorswap-lib/xchain-solana
```

Following peer dependencies have to be installed into your project. These are not included in `@thorswap-lib/xchain-solana`.

```
yarn add @thorswap-lib/xchain-client @thorswap-lib/xchain-crypto @thorswap-lib/xchain-util @solana/web3.js ed25519-hd-key
```

## Solana Client Testing
```
yarn install
yarn test
```

## Service Providers

This package uses the following service providers:

| Function                    | Service         | Notes                                                                                     |
| --------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| Balances                    | Solana RPC      | https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getBalance           |
| Transaction history         | Solana RPC      | https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getParsedTransactions|
| Transaction details by hash | Solana RPC      | https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getParsedTransaction |
| Transaction fees            | Solana RPC      | https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#getEstimatedFee     |
| Transaction broadcast       | Solana RPC      | https://solana-labs.github.io/solana-web3.js/modules.html#sendAndConfirmTransaction       |
| Explorer                    | Solana Explorer | https://explorer.solana.com/                                                              |


## Examples

```ts
// import `xchain-solana`
import { Client } from '@thorswap-lib/xchain-solana'

// Create a `Client`
const client = new Client({ network: Network.Testnet, phrase: 'my secret phrase' })

// get address
const address = client.getAddress()
console.log('address:', address) // address: DsgX3wpzzaZwuEUAZVMtg52sgywkXf7mUCHodzX2YJef

// get balances
const balances = await client.getBalance(address)
console.log('balances:', balances[0].amount.amount().toString()) // balance: 6

// get transactions
const txs = await client.getTransactions({ address })
console.log('txs total:', txs.total) // txs total: 20

// get transaction details
const tx = await client.getTransactionData('any-tx-hash')
console.log('tx asset:', tx.asset) // tx asset: { chain: 'SOL', symbol: 'SOL', ticker: 'SOL' }
```

For more examples check out tests in `./__tests__/client.test.ts`