# v.0.1.6 (2022-01-21)

- Pull in upstream package updates:

## ADD

- Add `getPrefix` to `utils`

## REMOVE

- Remove `nodeUrl` from Client constructor

# v.0.1.5 (2022-01-17)

- fix `broadcastTxToBlockChair` to get `transaction_hash`

# v.0.1.4 (2022-01-17)

- Update `broadcastTxToBlockChair`

# v.0.1.3 (2022-01-17)

- Change blockcypher api to blockchair
- rename `blockcypherApiKey` -> `apiKey`

# v.0.1.2 (2022-01-17)

- Add blockcypherApiKey param for constructor and `getSendTxUrl`
- Update `getSuggestedTxFee` to get high fee rate from blockcypher fee oracle

# v.0.1.1 (2022-01-06)

Update BroadcastTx API url

# v.0.1.0 (2021-12-29)

Fix sochain getBalance method

Details: https://github.com/thorswap/thorswap-xchainjs/issues/18