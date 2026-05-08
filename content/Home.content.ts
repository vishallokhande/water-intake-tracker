import { t, type DeclarationContent } from 'intlayer'

const HomeContent = {
  key: 'Home',
  content: {
    greeting_morning:   t({ en: 'Good morning' }),
    greeting_afternoon: t({ en: 'Good afternoon' }),
    greeting_evening:   t({ en: 'Good evening' }),
  },
} satisfies DeclarationContent

export default HomeContent
