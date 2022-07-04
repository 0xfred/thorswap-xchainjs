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
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: '__tests__/**',
      clean: true,
    }),
    commonjs(),
    json(),
  ],
  external: [
    ...builtinModules,
    '@thorswap-lib/xchain-client',
    '@thorswap-lib/xchain-crypto',
    '@thorswap-lib/xchain-util',
    'axios',
    'ethers',
  ],
}
