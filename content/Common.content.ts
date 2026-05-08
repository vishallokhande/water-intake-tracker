import { t, type DeclarationContent } from 'intlayer'

const CommonContent = {
  key: 'Common',
  content: {
    loading:         t({ en: 'Loading...' }),
    error:           t({ en: 'Something went wrong' }),
    tryAgain:        t({ en: 'Try again' }),
    cancel:          t({ en: 'Cancel' }),
    save:            t({ en: 'Save' }),
    delete:          t({ en: 'Delete' }),
    edit:            t({ en: 'Edit' }),
    back:            t({ en: 'Back' }),
    next:            t({ en: 'Next' }),
    continue:        t({ en: 'Continue' }),
    skip:            t({ en: 'Skip' }),
    done:            t({ en: 'Done' }),
    ok:              t({ en: 'OK' }),
    yes:             t({ en: 'Yes' }),
    no:              t({ en: 'No' }),
    noInternet:      t({ en: 'No internet connection' }),
    connectionError: t({ en: 'Check your connection and try again.' }),
    offlineBack:     t({ en: "You're back online" }),
  },
} satisfies DeclarationContent

export default CommonContent
