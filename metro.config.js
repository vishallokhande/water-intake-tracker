const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { withIntlayer } = require('react-native-intlayer/metro')

const config = getSentryExpoConfig(__dirname)

module.exports = withIntlayer(config)
