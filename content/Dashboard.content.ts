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
    motivation: {
      m0: t({ en: "Let's start your hydration journey! 🌊" }),
      m15: t({ en: 'Every drop counts. Keep going! 💧' }),
      m30: t({ en: "Good start! You're building momentum 🚀" }),
      m50: t({ en: 'Almost halfway there! Stay hydrated 💦' }),
      m70: t({ en: 'Over halfway! Your body loves this 🌿' }),
      m85: t({ en: 'So close! Push through the finish line 🏆' }),
      m100: t({ en: 'Almost there! One more sip! ✨' }),
      mDone: t({ en: "Goal crushed! You're a hydration champion! 🎉" }),
    },
    milestones: {
      ms3: t({ en: "3-day streak! You're building a great habit! 🔥" }),
      ms7: t({ en: '1-week warrior! Your cells are cheering! 💪' }),
      ms14: t({ en: '2 weeks strong! Pure dedication! ⚡' }),
      ms30: t({ en: "30-day legend! You're unstoppable! 🏆" }),
      ms60: t({ en: "60 days! You're a hydration master! 👑" }),
      ms100: t({ en: '100 days! Hall of fame level! 🌟' }),
      ms365: t({ en: '365 days! One full year! LEGENDARY! 🚀' }),
    },
    beverages: {
      water: t({ en: 'Water' }),
      coffee: t({ en: 'Coffee' }),
      tea: t({ en: 'Tea' }),
      juice: t({ en: 'Juice' }),
      sports: t({ en: 'Sports' }),
      milk: t({ en: 'Milk' }),
    },
  },
} satisfies DeclarationContent

export default DashboardContent
