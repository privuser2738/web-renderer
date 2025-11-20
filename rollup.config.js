import terser from '@rollup/plugin-terser';

export default [
  // UMD build (for browsers)
  {
    input: 'sdk/src/index.js',
    output: {
      file: 'sdk/dist/web-rerender.js',
      format: 'umd',
      name: 'WebRerender',
      sourcemap: true
    },
    plugins: []
  },
  // Minified UMD build
  {
    input: 'sdk/src/index.js',
    output: {
      file: 'sdk/dist/web-rerender.min.js',
      format: 'umd',
      name: 'WebRerender',
      sourcemap: true
    },
    plugins: [
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
  // ES Module build
  {
    input: 'sdk/src/index.js',
    output: {
      file: 'sdk/dist/web-rerender.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: []
  },
  // Extension build (copy to extension folder)
  {
    input: 'sdk/src/index.js',
    output: {
      file: 'extension/sdk/web-rerender.js',
      format: 'umd',
      name: 'WebRerender',
      sourcemap: false
    },
    plugins: []
  }
];
