import { t, type DeclarationContent } from 'intlayer'

const LandingContent = {
  key: 'landing',
  content: {
    header: {
      getStarted: t({ en: 'Get Started' }),
    },
    hero: {
      tagline: t({ en: 'Smart Hydration Tracking' }),
      description: t({
        en: 'A premium hydration tracker that learns your body, climate, and activity level to calculate your perfect daily water goal — then keeps you on track.',
      }),
    },
    features: [
      {
        icon: '💧',
        title: t({ en: 'One-Tap Logging' }),
        desc: t({ en: 'Log water and beverages in a single tap' }),
      },
      {
        icon: '🎯',
        title: t({ en: 'AI Goal Calculator' }),
        desc: t({ en: 'Science-backed goals for your body & lifestyle' }),
      },
      {
        icon: '📊',
        title: t({ en: 'Weekly Heatmap' }),
        desc: t({ en: 'Beautiful visual history of your hydration' }),
      },
      {
        icon: '🔥',
        title: t({ en: 'Streak Tracking' }),
        desc: t({ en: 'Stay motivated with daily streak milestones' }),
      },
      {
        icon: '⚡',
        title: t({ en: 'Smart Reminders' }),
        desc: t({ en: 'Adaptive reminders that know when you need water' }),
      },
      {
        icon: '🏆',
        title: t({ en: 'Multi-Beverage' }),
        desc: t({ en: 'Track coffee, tea, juice and more with smart multipliers' }),
      },
    ],
    footer: {
      cta: t({ en: '🚀 Start Your Hydration Journey' }),
      legal: t({ en: 'Free · No account required · Works offline' }),
    },
  },
} satisfies DeclarationContent

export default LandingContent
