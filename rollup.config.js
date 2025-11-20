import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  // UMD build (for browsers)
  {
    input: 'sdk/src/index.ts',
    output: {
      file: 'sdk/dist/web-rerender.js',
      format: 'umd',
      name: 'WebRerender',
      exports: 'default',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true
      })
    ]
  },
  // Minified UMD build
  {
    input: 'sdk/src/index.ts',
    output: {
      file: 'sdk/dist/web-rerender.min.js',
      format: 'umd',
      name: 'WebRerender',
      exports: 'default',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true
      }),
      terser({
        compress: {
          passes: 2
        },
        mangle: {
          properties: false
        }
      })
    ]
  },
  // ES Module build (with type definitions)
  {
    input: 'sdk/src/index.ts',
    output: {
      file: 'sdk/dist/web-rerender.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './sdk/dist',
        sourceMap: true
      })
    ]
  },
  // Extension build (copy to extension folder)
  {
    input: 'sdk/src/index.ts',
    output: {
      file: 'extension/sdk/web-rerender.js',
      format: 'umd',
      name: 'WebRerender',
      exports: 'default',
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: false
      })
    ]
  }
];
