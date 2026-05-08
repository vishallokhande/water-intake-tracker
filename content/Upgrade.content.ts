import { t, type DeclarationContent } from 'intlayer'

const UpgradeContent = {
  key: 'upgrade',
  content: {
    header: {
      eyebrow: t({ en: 'PREMIUM' }),
      title: t({ en: 'Unlock everything' }),
      subtitle: t({ en: 'Get full access to all pro features.' }),
    },
    features: [
      { icon: 'infinite-outline',       label: t({ en: 'Unlimited access to all features' }) },
      { icon: 'rocket-outline',         label: t({ en: 'Priority processing & speed' }) },
      { icon: 'shield-checkmark-outline', label: t({ en: 'Ad-free experience' }) },
      { icon: 'headset-outline',        label: t({ en: 'Priority support (24h response)' }) },
      { icon: 'star-outline',           label: t({ en: 'Early access to new features' }) },
    ],
    active: {
      title: t({ en: "You're on Pro" }),
      renews: t({ en: 'Renews {{date}}' }),
      expires: t({ en: 'Expires {{date}}' }),
      manage: t({ en: 'Manage or cancel subscription →' }),
    },
    packages: {
      yearly: t({ en: 'Yearly' }),
      monthly: t({ en: 'Monthly' }),
      perYear: t({ en: '/ year' }),
      perMonth: t({ en: '/ month' }),
      billedAnnually: t({ en: 'billed annually' }),
      bestValue: t({ en: 'Best Value · {{pct}}% off' }),
      unavailable: t({ en: 'Subscription plans unavailable right now. Please try again later.' }),
    },
    cta: {
      unlock: t({ en: 'Unlock Pro' }),
      freeTier: t({ en: 'Free' }),
      freeDesc: t({ en: 'Limited access' }),
      currentPlan: t({ en: 'Current plan' }),
    },
    footer: {
      restore: t({ en: 'Restore purchases' }),
      redeem: t({ en: 'Redeem promo code' }),
      legal: t({ en: 'Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Manage in your account settings.' }),
    },
    modals: {
      purchaseFailed: {
        title: t({ en: 'Purchase failed' }),
        message: t({ en: 'Something went wrong. Please try again.' }),
      },
      restored: {
        title: t({ en: 'Purchases restored' }),
        message: t({ en: 'Your subscription has been restored.' }),
      },
      nothingToRestore: {
        title: t({ en: 'Nothing to restore' }),
        message: t({ en: 'No active subscription found for this account.' }),
      },
      restoreFailed: {
        title: t({ en: 'Restore failed' }),
        message: t({ en: 'Something went wrong. Please try again.' }),
      },
    },
  },
} satisfies DeclarationContent

export default UpgradeContent
