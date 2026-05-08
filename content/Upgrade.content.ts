import { t, type DeclarationContent } from 'intlayer'

const UpgradeContent = {
  key: 'Upgrade',
  content: {
    eyebrow:            t({ en: 'PREMIUM' }),
    title:              t({ en: 'Unlock everything' }),
    subtitle:           t({ en: 'Get full access to all pro features.' }),
    youreOnPro:         t({ en: "You're on Pro" }),
    renewsDate:         t({ en: 'Renews {{date}}' }),
    expiresDate:        t({ en: 'Expires {{date}}' }),
    yearly:             t({ en: 'Yearly' }),
    monthly:            t({ en: 'Monthly' }),
    billedAnnually:     t({ en: 'billed annually' }),
    perMonth:           t({ en: '/ month' }),
    perYear:            t({ en: '/ year' }),
    bestValue:          t({ en: 'Best Value' }),
    getPro:             t({ en: 'Unlock Pro' }),
    restorePurchases:   t({ en: 'Restore purchases' }),
    redeemCode:         t({ en: 'Redeem promo code' }),
    cancelAnytime:      t({ en: 'Cancel anytime' }),
    plansUnavailable:   t({ en: 'Subscription plans unavailable. Please try again later.' }),
    purchaseFailed:     t({ en: 'Purchase failed' }),
    purchaseFailedMsg:  t({ en: 'Something went wrong. Please try again.' }),
    restoreSuccess:     t({ en: 'Purchases restored' }),
    restoreSuccessMsg:  t({ en: 'Your subscription has been restored.' }),
    nothingToRestore:   t({ en: 'Nothing to restore' }),
    nothingToRestoreMsg: t({ en: 'No active subscription found for this account.' }),
    restoreFailed:      t({ en: 'Restore failed' }),
    manageSub:          t({ en: 'Manage or cancel subscription' }),
    currentPlan:        t({ en: 'Current plan' }),
    freeTier:           t({ en: 'Free' }),
    freeDesc:           t({ en: 'Limited access' }),
    legalNote:          t({ en: 'Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.' }),
  },
} satisfies DeclarationContent

export default UpgradeContent
