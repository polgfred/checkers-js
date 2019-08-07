module.exports = {
  plugins: {
    'postcss-custom-properties': {
      preserve: false,
    },
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    },
    'postcss-calc': {},
  },
};
