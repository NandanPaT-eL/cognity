import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://cognity.com.au'),

  title: {
    default: 'Cognity — AI Onboarding for SaaS',
    template: '%s · Cognity',
  },
  description:
    'Replace static product tours with real AI conversations. Cognity asks each user what they want to achieve, guides them step by step, and automatically intervenes when they get stuck — so more users activate.',

  keywords: [
    'AI onboarding',
    'user onboarding SaaS',
    'product activation',
    'onboarding automation',
    'user activation',
    'reduce churn',
    'interactive product tour',
    'AI chatbot onboarding',
    'customer success automation',
    'SaaS onboarding tool',
    'stuck user detection',
    'user activation platform',
    'Cognity',
  ],

  authors: [{ name: 'Cognity', url: 'https://cognity.com.au' }],
  creator: 'Cognity',
  publisher: 'Cognity',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://cognity.com.au',
    siteName: 'Cognity',
    title: 'Cognity — AI Onboarding for SaaS',
    description:
      'Turn every signup into an activated user. Cognity replaces static product tours with real AI conversations that guide each user to their first success moment.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cognity — AI Onboarding for SaaS',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Cognity — AI Onboarding for SaaS',
    description:
      'Turn every signup into an activated user. Real AI conversations, not scripted tours.',
    images: ['/og-image.png'],
    creator: '@cognityapp',
  },

  alternates: {
    canonical: 'https://cognity.com.au',
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',

  category: 'technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en-AU" className="scroll-smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
          {/* Canonical */}
          <link rel="canonical" href="https://cognity.com.au" />
          {/* JSON-LD structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Cognity',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                url: 'https://cognity.com.au',
                description:
                  'AI-powered user onboarding platform for SaaS companies. Replace static product tours with real conversations that guide users to activation.',
                offers: [
                  {
                    '@type': 'Offer',
                    price: '39',
                    priceCurrency: 'AUD',
                    name: 'Starter Plan',
                  },
                  {
                    '@type': 'Offer',
                    price: '99',
                    priceCurrency: 'AUD',
                    name: 'Growth Plan',
                  },
                ],
                author: {
                  '@type': 'Organization',
                  name: 'Cognity',
                  url: 'https://cognity.com.au',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  reviewCount: '12',
                },
              }),
            }}
          />
        </head>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
