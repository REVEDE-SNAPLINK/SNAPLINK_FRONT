module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['/'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@': './src',
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]
};
