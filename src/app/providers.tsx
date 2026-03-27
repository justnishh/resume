'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ErrorSuppressor } from '@/components/ErrorSuppressor'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ErrorSuppressor />
      {children}
    </SessionProvider>
  )
}
