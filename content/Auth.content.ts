import { t, type DeclarationContent } from 'intlayer'

const AuthContent = {
  key: 'Auth',
  content: {
    signInTitle:           t({ en: 'Sign in' }),
    signInSub:             t({ en: "We'll send a one-time code. No password required." }),
    emailLabel:            t({ en: 'Email' }),
    emailPlaceholder:      t({ en: 'you@example.com' }),
    continueBtn:           t({ en: 'Continue  →' }),
    checkInboxTitle:       t({ en: 'Check your inbox' }),
    otpHint:               t({ en: 'Enter the 6-digit code we sent. Check spam if needed.' }),
    verifyBtn:             t({ en: 'Verify Code' }),
    resendIn:              t({ en: 'Resend in {{count}}s' }),
    resendCode:            t({ en: 'Resend code' }),
    changeEmail:           t({ en: 'Change email' }),
    privacyPolicy:         t({ en: 'Privacy Policy' }),
    termsOfService:        t({ en: 'Terms of Service' }),
    lockedRemaining:       t({ en: 'Locked · {{time}} remaining' }),
    errorInvalidEmail:     t({ en: 'Enter a valid email address' }),
    errorDisposableEmail:  t({ en: 'Temporary email addresses are not allowed.' }),
    errorInvalidCode:      t({ en: 'Invalid code. {{count}} attempt{{plural}} left.' }),
    errorTooManyAttempts:  t({ en: 'Too many attempts. Wait {{minutes}} minute(s).' }),
    errorLocked15Min:      t({ en: 'Too many failed attempts. Please wait 15 minutes.' }),
  },
} satisfies DeclarationContent

export default AuthContent
