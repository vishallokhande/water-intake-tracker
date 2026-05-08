import { t, type DeclarationContent } from 'intlayer'

const TabsContent = {
  key: 'Tabs',
  content: {
    home:    t({ en: 'Home' }),
    profile: t({ en: 'Profile' }),
  },
} satisfies DeclarationContent

export default TabsContent
