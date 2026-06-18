import { SignUp } from '@clerk/nextjs'
import { AuthPanel } from '@/components/auth-panel'
import { clerkAppearance } from '@/lib/clerk-appearance'

export default function SignUpPage() {
  return (
    <AuthPanel
      headline={<>Set up your account<br />in under a minute.</>}
      subtext="Connect your product, upload your docs, and Cognity starts guiding users from day one."
    >
      <SignUp
        path="/auth/sign-up"
        routing="path"
        signInUrl="/auth/sign-in"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthPanel>
  )
}
