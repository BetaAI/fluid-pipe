import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

// console.log(pkg);

const plugins = [
  resolve(),
  babel({
    exclude: 'node_modules/**'
  }),
];

if (process.env.NODE_ENV === 'prd') {
  plugins.push(terser());
}

const config = {
  input: 'src/index.js',
  output:[
    {
      format: 'cjs',
      file: pkg.main,
      name: 'FluidPipe',
      sourcemap: true
    },
    {
      format: 'iife',
      file: pkg.browser,
      name: 'FluidPipe',
      sourcemap: true
    },
    {
      format: 'esm',
      file: pkg.module,
      name: 'FluidPipe',
      sourcemap: true
    },
  ],
  plugins,
}

export default config;