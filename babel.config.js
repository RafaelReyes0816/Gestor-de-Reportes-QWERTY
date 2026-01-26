module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // NOTE: react-native-reanimated/plugin debe ir al final.
    plugins: ["react-native-reanimated/plugin"],
  };
};

