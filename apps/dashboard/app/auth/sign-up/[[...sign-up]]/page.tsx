import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen bg-paper">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between bg-ink p-12">
        <div>
          <span className="text-[22px] font-bold tracking-tight text-white">Cognity</span>
          <span className="ml-1.5 text-[11px] font-medium text-white/30 uppercase tracking-widest align-middle">v1</span>
        </div>
        <div>
          <p className="text-[28px] font-bold text-white leading-snug tracking-tight">
            Set up your account<br />in under a minute.
          </p>
          <p className="mt-3 text-[14px] text-white/40 leading-relaxed">
            Connect your product, upload your docs, and Cognity starts guiding users on day one.
          </p>
        </div>
        <p className="text-[12px] text-white/20">© {new Date().getFullYear()} Cognity</p>
      </div>

      {/* Right sign-up panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <SignUp
          path="/auth/sign-up"
          routing="path"
          signInUrl="/auth/sign-in"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full max-w-md',
              card: 'shadow-none border border-ink/08 rounded-xl bg-white',
            }
          }}
        />
      </div>
    </main>
  )
}
