module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-flow',
    [
      '@babel/preset-env',
      {
        modules: 'cjs',
        targets: {
          node: 'current',
        },
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};
