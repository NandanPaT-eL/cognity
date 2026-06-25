import { SignIn } from '@clerk/nextjs'
import { AuthPanel } from '@/components/auth-panel'
import { clerkAppearance } from '@/lib/clerk-appearance'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in to Cognity',
  description: 'Sign in to your Cognity dashboard to manage onboarding, docs, and activation analytics.',
  robots: { index: false, follow: false },
}

export default function SignInPage() {
  return (
    <AuthPanel
      headline={<>Turn new users into<br />activated customers.</>}
      subtext="AI-powered onboarding that guides each user to their first success moment — automatically."
    >
      <SignIn
        path="/auth/sign-in"
        routing="path"
        signUpUrl="/auth/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthPanel>
  )
}
