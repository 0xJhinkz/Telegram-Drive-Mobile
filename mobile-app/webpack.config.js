const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Inject polyfills as first entry points
  if (config.entry) {
    const polyfillPath = path.resolve(__dirname, 'polyfills.js');
    if (Array.isArray(config.entry)) {
      config.entry.unshift(polyfillPath);
    } else if (typeof config.entry === 'object') {
      const firstKey = Object.keys(config.entry)[0];
      if (Array.isArray(config.entry[firstKey])) {
        config.entry[firstKey].unshift(polyfillPath);
      }
    }
  }

  // Polyfills for Telegram's gramjs Node.js dependencies
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    net: false,
    tls: false,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    util: require.resolve('util/'),
    os: require.resolve('os-browserify/browser'),
    assert: require.resolve('assert/'),
    constants: require.resolve('constants-browserify'),
    vm: require.resolve('vm-browserify'),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  config.ignoreWarnings = [
    /Failed to parse source map/,
    /smart-buffer/,
    /socks/,
  ];

  return config;
};
