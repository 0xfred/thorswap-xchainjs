# `@thorswap-lib/xchain-client`

Cosmos Module for XChainJS Clients

## Installation

```
yarn add @thorswap-lib/xchain-cosmos
```

Following peer dependencies have to be installed into your project. These are not included in `@thorswap-lib/xchain-cosmos`.

```
yarn add @thorswap-lib/xchain-client @thorswap-lib/xchain-crypto @thorswap-lib/xchain-util axios cosmos-client bip32 long
```

## Cosmos Client Testing

```
yarn install
yarn test
```

Important note: Make sure to install same version of `cosmos-client` as `xchain-cosmos` is using (currently `cosmos-client@0.39.2` ). In other case things might break.

## Service Providers

This package uses the following service providers:

| Function                    | Service    | Notes                                                               |
| --------------------------- | ---------- | ------------------------------------------------------------------- |
| Balances                    | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`GET /bank/balances/{address}`) |
| Transaction history         | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`GET /txs`)                     |
| Transaction details by hash | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`GET /txs/{hash}`)              |
| Transaction broadcast       | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`POST /txs`)                    |
| Explorer                    | BigDipper  | https://cosmos.bigdipper.live                                       |

Rate limits: No
