import { t, type DeclarationContent } from 'intlayer'

const OnboardingContent = {
  key: 'onboarding',
  content: {
    steps: {
      welcome: {
        title: t({ en: 'Welcome to\nHydroFlow' }),
        subtitle: t({ en: "Your personal hydration OS. We'll calculate a science-backed daily water goal just for you in 60 seconds." }),
        features: [
          t({ en: '🎯 Personalized daily goal' }),
          t({ en: '📊 Weekly & monthly heatmap' }),
          t({ en: '🔥 Streak tracking' }),
          t({ en: '💧 Multi-beverage support' }),
        ],
      },
      gender: {
        title: t({ en: "What's your\nbiological sex?" }),
        subtitle: t({ en: 'This helps us calculate your baseline hydration need.' }),
        options: {
          male: {
            label: t({ en: 'Male' }),
            desc: t({ en: 'Biological males need ~10% more' }),
          },
          female: {
            label: t({ en: 'Female' }),
            desc: t({ en: 'Biological females need ~10% less' }),
          },
          other: {
            label: t({ en: 'Other' }),
            desc: t({ en: "We'll use a balanced baseline" }),
          },
        },
      },
      weight: {
        title: t({ en: "What's your\nbody weight?" }),
        subtitle: t({ en: 'The most accurate factor in calculating your daily water needs.' }),
        unit: t({ en: 'kg' }),
        hint: t({ en: 'Tap the number to edit' }),
      },
      activity: {
        title: t({ en: 'How active\nare you?' }),
        subtitle: t({ en: 'Active people need significantly more water.' }),
        options: {
          sedentary: {
            label: t({ en: 'Sedentary' }),
            desc: t({ en: 'Mostly sitting, desk job' }),
          },
          light: {
            label: t({ en: 'Light' }),
            desc: t({ en: '1–3 days of light exercise/week' }),
          },
          moderate: {
            label: t({ en: 'Moderate' }),
            desc: t({ en: '3–5 days of moderate exercise' }),
          },
          active: {
            label: t({ en: 'Very Active' }),
            desc: t({ en: 'Daily intense workouts' }),
          },
          athlete: {
            label: t({ en: 'Athlete' }),
            desc: t({ en: 'Professional / twice daily' }),
          },
        },
      },
      climate: {
        title: t({ en: "What's your\nclimate like?" }),
        subtitle: t({ en: 'Hot environments significantly increase water loss.' }),
        options: {
          arctic: {
            label: t({ en: 'Cold' }),
            desc: t({ en: 'Below 10°C / 50°F' }),
          },
          temperate: {
            label: t({ en: 'Temperate' }),
            desc: t({ en: '10–25°C / 50–77°F' }),
          },
          warm: {
            label: t({ en: 'Warm' }),
            desc: t({ en: '25–32°C / 77–90°F' }),
          },
          hot: {
            label: t({ en: 'Hot' }),
            desc: t({ en: '32–40°C / 90–104°F' }),
          },
          tropical: {
            label: t({ en: 'Tropical' }),
            desc: t({ en: 'Hot + high humidity' }),
          },
        },
      },
      goalPreview: {
        title: t({ en: 'Your Daily Goal' }),
        subtitle: t({ en: '≈ {{count}} glasses of water' }),
      },
    },
    navigation: {
      back: t({ en: '← Back' }),
      continue: t({ en: 'Continue →' }),
      finish: t({ en: '🚀 Start HydroFlow' }),
      stepLabel: t({ en: 'Step {{current}} of {{total}}' }),
    },
  },
} satisfies DeclarationContent

export default OnboardingContent
