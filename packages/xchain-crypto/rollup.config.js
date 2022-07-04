import { builtinModules } from 'module'
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
    external(),
    json(),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: '__tests__/**',
      clean: true,
    }),
    resolve({ preferBuiltins: true, browser: true }),
    commonjs({
      include: /node_modules/,
      exclude: '**/*.json',
    }),
  ],
  external: [...builtinModules, 'bech32', 'bip39', 'crypto-js', 'foundry-primitives', 'hdkey', 'uuid'],
}
