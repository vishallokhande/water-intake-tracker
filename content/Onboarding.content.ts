import { t, type DeclarationContent } from 'intlayer'

const OnboardingContent = {
  key: 'Onboarding',
  content: {
    title:       t({ en: 'What should we call you?' }),
    subtitle:    t({ en: 'This is optional — you can always change it later.' }),
    namePlaceholder: t({ en: 'Enter your name' }),
    continueBtn: t({ en: 'Continue  →' }),
    getStarted:  t({ en: 'Get Started  →' }),
    skipForNow:  t({ en: 'Skip for now' }),
  },
} satisfies DeclarationContent

export default OnboardingContent
