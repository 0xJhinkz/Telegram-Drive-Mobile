const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Map Node.js built-in modules to browser-compatible polyfills.
// Required because gramjs (telegram package) imports `crypto`, `stream`, etc.
// Metro cannot resolve Node built-ins natively unlike webpack.
config.resolver.extraNodeModules = {
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  path: require.resolve('path-browserify'),
  os: require.resolve('os-browserify/browser'),
  assert: require.resolve('assert/'),
  constants: require.resolve('constants-browserify'),
  vm: require.resolve('vm-browserify'),
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
  // Stub out modules that have no browser equivalent
  fs: false,
  net: false,
  tls: false,
};

module.exports = config;
