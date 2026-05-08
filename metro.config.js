const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { configMetroIntlayerSync } = require('react-native-intlayer/metro')

const config = getSentryExpoConfig(__dirname)

module.exports = configMetroIntlayerSync(config)
