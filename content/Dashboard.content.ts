import { t, type DeclarationContent } from 'intlayer'

const DashboardContent = {
  key: 'dashboard',
  content: {
    customModal: {
      title: t({ en: 'Custom Amount' }),
      subtitle: t({ en: 'How much did you drink?' }),
      unit: t({ en: 'ml' }),
      logButton: t({ en: '💧 Log {{value}} ml' }),
    },
    header: {
      title: t({ en: 'HydroFlow' }),
      scoreLabel: t({ en: 'score' }),
    },
    greetings: {
      morning: t({ en: 'Good morning ☀️' }),
      afternoon: t({ en: 'Good afternoon 🌤️' }),
      evening: t({ en: 'Good evening 🌙' }),
    },
    stats: {
      today: t({ en: 'Today' }),
      goal: t({ en: 'Goal' }),
      remaining: t({ en: 'Remaining' }),
      logged: t({ en: 'logged' }),
    },
    sections: {
      beverageType: t({ en: 'Beverage Type' }),
      quickLog: t({ en: 'Quick Log' }),
      todaysLog: t({ en: 'Today\'s Log' }),
    },
    buttons: {
      custom: t({ en: 'Custom' }),
      undo: t({ en: 'Undo' }),
    },
    toasts: {
      logged: t({ en: 'Logged!' }),
      amountLogged: t({ en: '+{{ml}}ml logged' }),
    },
  },
} satisfies DeclarationContent

export default DashboardContent
