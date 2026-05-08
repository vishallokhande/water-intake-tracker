import { t, type DeclarationContent } from 'intlayer'

const ProfileContent = {
  key: 'Profile',
  content: {
    signOut:         t({ en: 'Sign out' }),
    signOutTitle:    t({ en: 'Sign out' }),
    signOutSubtitle: t({ en: "You'll be signed out of your account." }),
    signOutConfirm:  t({ en: 'Sign out' }),
    privacy:         t({ en: 'Privacy Policy' }),
    terms:           t({ en: 'Terms of Service' }),
    notifications:   t({ en: 'Notifications' }),
    language:        t({ en: 'Language' }),
  },
} satisfies DeclarationContent

export default ProfileContent
