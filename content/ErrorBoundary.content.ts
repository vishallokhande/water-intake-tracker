import { t, type DeclarationContent } from 'intlayer'

const ErrorBoundaryContent = {
  key: 'ErrorBoundary',
  content: {
    title:    t({ en: 'Something went wrong' }),
    subtitle: t({ en: 'Please close and reopen the app.' }),
  },
} satisfies DeclarationContent

export default ErrorBoundaryContent
