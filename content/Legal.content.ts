import { t, type DeclarationContent } from 'intlayer'

const LegalContent = {
  key: 'legal',
  content: {
    privacy: {
      title: t({ en: 'Privacy Policy' }),
      lastUpdated: t({ en: 'Last Updated: May 2026' }),
    },
    terms: {
      title: t({ en: 'Terms of Service' }),
      lastUpdated: t({ en: 'Last Updated: May 2026' }),
    },
    support: {
      title: t({ en: 'Support' }),
      subtitle: t({ en: 'How can we help you?' }),
      email: t({ en: 'Email Support' }),
      faq: t({ en: 'Frequently Asked Questions' }),
    },
    common: {
      back: t({ en: 'Back' }),
    },
  },
} satisfies DeclarationContent

export default LegalContent
