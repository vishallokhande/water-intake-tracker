import { Locales, type IntlayerConfig } from 'intlayer'

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.ENGLISH, Locales.SPANISH, Locales.FRENCH],
    defaultLocale: Locales.ENGLISH,
  },
  content: {
    // Scan the ./content directory for all *.content.ts declaration files
    contentDir: ['./content'],
  },
}

export default config
