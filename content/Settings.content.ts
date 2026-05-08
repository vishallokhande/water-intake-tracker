import { t, type DeclarationContent } from 'intlayer'

const SettingsContent = {
  key: 'settings',
  content: {
    title: t({ en: 'Settings' }),
    subtitle: t({ en: 'Personalize HydroFlow' }),
    profileSection: {
      name: t({ en: 'HydroFlow User' }),
      streak: t({ en: '{{streak}} day streak' }),
      goal: t({ en: '{{goal}}ml/day goal' }),
    },
    goalCalculator: {
      title: t({ en: '💡 Smart Goal Calculator' }),
      description: t({ en: 'Adjusts your daily target based on your body and lifestyle.' }),
      weight: t({ en: 'Body Weight' }),
      gender: t({ en: 'Biological Gender' }),
      activity: t({ en: 'Activity Level' }),
      climate: t({ en: 'Climate / Environment' }),
    },
    recommendation: {
      title: t({ en: 'Recommended Daily Goal' }),
      unit: t({ en: 'ml' }),
      glasses: t({ en: '≈ {{count}} glasses of water' }),
    },
    preferences: {
      title: t({ en: '⚙️ App Preferences' }),
      reminders: t({ en: 'Smart Reminders' }),
      haptics: t({ en: 'Haptic Feedback' }),
      darkMode: t({ en: 'Dark Mode' }),
    },
    about: {
      title: t({ en: '📱 About' }),
      privacy: t({ en: 'Privacy Policy' }),
      terms: t({ en: 'Terms of Service' }),
      support: t({ en: 'Support' }),
      rate: t({ en: 'Rate HydroFlow' }),
    },
    version: t({ en: 'HydroFlow v1.0.0 · Made with 💙' }),
  },
} satisfies DeclarationContent

export default SettingsContent
