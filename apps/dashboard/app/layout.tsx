import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Cognity — AI Onboarding for SaaS',
    template: '%s · Cognity',
  },
  description:
    'Replace static product tours with real conversations. Cognity asks each user what they want, guides them step by step, and catches them when they get stuck.',
  metadataBase: new URL('https://cognity.ai'),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Cognity — AI Onboarding for SaaS',
    description: 'Guide every user to their first success moment automatically.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}