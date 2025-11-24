// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo + NativeWind (jsxImportSource)
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // NativeWind se usa como PRESET, no como plugin
      "nativewind/babel",
    ],
    plugins: [
      // Necesario para expo-router
      require.resolve("expo-router/babel"),
      // Para Reanimated 4 en Expo SDK 54 se usa worklets:
      "react-native-worklets/plugin",
    ],
  };
};
