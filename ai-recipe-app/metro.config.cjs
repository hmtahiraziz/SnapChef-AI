const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Prevent Metro watcher from crashing on temporary CMake /.cxx/ or /build/ folders during builds
config.resolver.blockList = [
  /.*\/node_modules\/.*\/android\/\.cxx\/.*/,
  /.*\/node_modules\/.*\/android\/build\/.*/,
  /.*\/android\/\.cxx\/.*/,
  /.*\/android\/build\/.*/,
];

module.exports = withNativeWind(config, { input: './global.css' });
