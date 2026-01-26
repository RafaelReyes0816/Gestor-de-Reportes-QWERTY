// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configurar resolver para excluir react-native-maps en web
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Excluir react-native-maps del bundle en web
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      type: "empty",
    };
  }
  // Usar el resolver por defecto para otros módulos
  return defaultResolver ? defaultResolver(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
