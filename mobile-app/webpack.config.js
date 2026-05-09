const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Use index.web.js as the entry point if it exists
  const indexWebPath = path.resolve(__dirname, 'index.web.js');
  const indexPath = path.resolve(__dirname, 'index.js');
  const entryPath = fs.existsSync(indexWebPath) ? indexWebPath : indexPath;

  if (config.entry) {
    if (Array.isArray(config.entry)) {
      config.entry[0] = entryPath;
    } else if (typeof config.entry === 'object') {
      const firstKey = Object.keys(config.entry)[0];
      if (Array.isArray(config.entry[firstKey])) {
        config.entry[firstKey][0] = entryPath;
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
