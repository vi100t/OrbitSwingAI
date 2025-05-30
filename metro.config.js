const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Add polyfills for web
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  events: require.resolve('events'),
};

module.exports = config;