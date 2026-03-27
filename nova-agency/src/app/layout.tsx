import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nova Agency | AI-Native Digital Solutions',
  description: 'Where AI and human talent create breakthrough digital solutions. Transform your business with cutting-edge AI technology.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="noise-overlay">
      <body className="min-h-screen bg-nova-dark">
        {children}
      </body>
    </html>
  )
}