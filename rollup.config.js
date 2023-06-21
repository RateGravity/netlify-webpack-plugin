import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  plugins: [resolve({ extensions: ['.ts'] }), babel({ extensions: ['.ts'] })],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ]
};
