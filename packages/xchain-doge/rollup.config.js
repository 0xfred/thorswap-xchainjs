import { builtinModules } from 'module'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    json(),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: '__tests__/**',
      clean: true,
      browser: true,
    }),
    resolve({ extensions: ['.js', '.ts'], preferBuiltins: true, browser: true }),
    commonjs({
      browser: true,
    }),
  ],
  external: [
    ...builtinModules,
    '@thorswap-lib/atlas',
    '@thorswap-lib/xchain-client',
    '@thorswap-lib/xchain-crypto',
    'axios',
    'bip32',
    'bitcoinjs-lib',
    'coininfo',
    'coinselect',
    'ecpair',
    'tiny-secp256k1',
    'wif',
  ],
}
