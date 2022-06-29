import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
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
    json({}),
    external(),
    resolve({ browser: true }),
    typescript({
      exclude: '__tests__/**',
      clean: true,
    }),
    commonjs(),
  ],
  external: [
    '@thorswap-lib/binance-chain-sdk',
    'axios',
    'buffer',
    'crypto',
    'readable-stream',
    'safe-buffer',
    'stream',
    'string_decoder',
  ],
}
