import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Cognity',
  description: 'Terms of Service for Cognity — the AI onboarding platform. Victoria, Australia governing law.',
  alternates: { canonical: 'https://cognity.com.au/terms' },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'var(--canvas)' }}>
      <div className="cog-container max-w-3xl py-20">

        {/* Header */}
        <div className="mb-12">
          <p className="cog-eyebrow mb-3">Legal</p>
          <h1
            className="text-[38px] font-extrabold tracking-[-0.035em] leading-[1.1]"
            style={{ color: 'var(--void)' }}
          >
            Terms of Service
          </h1>
          <p className="mt-4 text-[15px]" style={{ color: 'var(--text-soft)' }}>
            Last updated: 25 June 2026 &nbsp;·&nbsp; Effective immediately
          </p>
        </div>

        <div className="prose-cog space-y-10" style={{ color: 'var(--text-soft)' }}>

          {/* 1 */}
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the Cognity platform (&ldquo;Service&rdquo;), you agree to be
              bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these
              Terms, do not use the Service.
            </p>
            <p>
              The Service is operated by <strong>Cognity Pty Ltd</strong>, a company registered
              in Victoria, Australia (&ldquo;Cognity&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
              References to &ldquo;you&rdquo; or &ldquo;Customer&rdquo; mean the organisation or
              individual accessing the Service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2>2. Acceptable Use</h2>
            <p>You agree <strong>not</strong> to use the Service to:</p>
            <ul>
              <li>Upload, transmit, or process any illegal content or content that violates any
                applicable law or regulation.</li>
              <li>Harass, threaten, or harm any person through AI-generated conversations.</li>
              <li>Generate, distribute, or display content that is defamatory, fraudulent, obscene,
                or violates third-party intellectual property rights.</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service.</li>
              <li>Use the Service to train competing AI models or to replicate Cognity&apos;s core
                functionality.</li>
              <li>Circumvent usage limits, rate limits, or access controls.</li>
              <li>Knowingly introduce malware, viruses, or other malicious code.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate this policy
              without prior notice.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2>3. Subscription Plans and Billing</h2>

            <h3>3.1 Plans</h3>
            <p>
              The Service is offered on the following plans: Free/Beta, Starter (monthly), Growth
              (monthly), and Lifetime. Plan features and limits are described at{' '}
              <a href="https://cognity.com.au/#pricing">cognity.com.au/#pricing</a> and may be
              updated from time to time with reasonable notice.
            </p>

            <h3>3.2 Auto-renewal</h3>
            <p>
              Monthly subscription plans (Starter, Growth) automatically renew at the start of
              each calendar month using the payment method on file. By subscribing, you authorise
              Cognity to charge your payment method on a recurring basis until you cancel.
            </p>

            <h3>3.3 Refund Policy</h3>
            <ul>
              <li>
                <strong>Monthly subscriptions:</strong> No refunds are issued for monthly
                subscription charges once a billing period has begun. You may cancel at any time
                to prevent future charges.
              </li>
              <li>
                <strong>Annual subscriptions (if offered):</strong> Customers may request a pro-rata
                refund within 30 days of their annual payment date.
              </li>
              <li>
                <strong>Beta period:</strong> During the Beta period, exceptional refund requests
                may be considered at our sole discretion. Contact{' '}
                <a href="mailto:support@cognity.com.au">support@cognity.com.au</a>.
              </li>
            </ul>

            <h3>3.4 Price Changes</h3>
            <p>
              We will give you at least 30 days&apos; notice before increasing the price of a
              plan you are subscribed to. Continued use after the effective date constitutes
              acceptance of the new price.
            </p>

            <h3>3.5 Failed Payments</h3>
            <p>
              If a payment fails, we will notify you by email and retry the charge. After multiple
              failed attempts, your plan may be downgraded to Free until payment is resolved.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2>4. Beta Lifetime Deal</h2>
            <p>
              During the Cognity Beta period, a one-time &ldquo;Beta Lifetime
              Deal&rdquo; is available at a promotional price. Purchasing this
              deal grants the following rights and is subject to the following
              conditions:
            </p>
            <ul>
              <li>
                <strong>Beta period access:</strong> You receive full access to
                Cognity at the limits active at your date of purchase for the
                entire duration of the Beta period, at no additional charge.
              </li>
              <li>
                <strong>Post-beta transition:</strong> When Cognity exits Beta
                and launches publicly, Beta Lifetime Deal holders will be
                automatically grandfathered onto the Growth plan (or its
                equivalent at launch) at no additional cost and with no
                recurring charges, for as long as the Service operates. The
                limits of the plan you are grandfathered onto are those of the
                Growth plan at the time of launch, which may differ from beta
                limits.
              </li>
              <li>
                <strong>No recurring charges:</strong> The one-time payment is
                the only charge. You will never be billed again unless you
                voluntarily upgrade to a higher tier introduced after launch.
              </li>
              <li>
                <strong>Availability:</strong> The Beta Lifetime Deal is limited
                to the first 50 purchasers and may be withdrawn at any time
                before that cap is reached. It is not available after the Beta
                period ends.
              </li>
              <li>
                <strong>Non-transferable:</strong> Beta Lifetime access is
                personal to the purchasing organisation and cannot be
                transferred or resold.
              </li>
              <li>
                <strong>Fair use:</strong> Access is subject to these Terms.
                Violation of Terms may result in termination without refund.
              </li>
              <li>
                <strong>Service discontinuation:</strong> If Cognity discontinues
                the Service entirely, we will provide at least 6 months&apos;
                written notice to Beta Lifetime Deal holders. No refund is owed
                in that event.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2>5. Data and Privacy</h2>
            <p>
              Your use of the Service is subject to our{' '}
              <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms.
              By using the Service, you agree to the collection and use of information as
              described in the Privacy Policy.
            </p>
            <p>
              You are responsible for ensuring that your end users are notified that Cognity
              processes their anonymised data (chat messages, page paths, hashed user IDs) for
              the purpose of providing the onboarding Service.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              You retain ownership of all content you upload (documentation, custom prompts).
              By uploading content, you grant Cognity a non-exclusive, worldwide licence to use
              that content solely to operate and improve the Service for your account.
            </p>
            <p>
              Cognity retains all rights in the platform, models, code, brand, and related
              intellectual property. These Terms do not grant you any rights to Cognity&apos;s IP.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2>7. Disclaimers and Limitation of Liability</h2>

            <h3>7.1 &ldquo;As Is&rdquo; Service</h3>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranty of any kind, express or implied. We do not warrant that the Service will be
              error-free, uninterrupted, or that AI-generated content will be accurate or complete.
            </p>

            <h3>7.2 Liability Cap</h3>
            <p>
              To the maximum extent permitted by applicable law, Cognity&apos;s total cumulative
              liability to you arising out of or related to these Terms or the Service (whether in
              contract, tort, or otherwise) shall not exceed the <strong>total fees you paid
              to Cognity in the 12 months immediately preceding the event giving rise to the
              claim</strong>.
            </p>

            <h3>7.3 Exclusions</h3>
            <p>
              In no event shall Cognity be liable for indirect, incidental, special, consequential,
              or punitive damages, including loss of profits, data, or goodwill, even if advised
              of the possibility of such damages.
            </p>

            <h3>7.4 Consumer Guarantees</h3>
            <p>
              Nothing in these Terms excludes any statutory guarantees, rights, or remedies you
              may have under the Australian Consumer Law (Schedule 2 of the Competition and
              Consumer Act 2010 (Cth)).
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2>8. Termination</h2>
            <p>
              Either party may terminate these Terms at any time by cancelling the subscription
              (you) or by providing 30 days&apos; written notice (us). We may terminate
              immediately if you breach these Terms or if required by law.
            </p>
            <p>
              Upon termination, your access to the Service ceases. We will retain your data
              per our Privacy Policy retention schedule, and you may request deletion.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2>9. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of the State of{' '}
              <strong>Victoria, Australia</strong>. You agree to submit to the exclusive
              jurisdiction of the courts of Victoria for any dispute arising out of these Terms.
            </p>
            <p>
              Before commencing legal proceedings, the parties agree to attempt to resolve
              disputes informally by emailing{' '}
              <a href="mailto:support@cognity.com.au">support@cognity.com.au</a> with the
              subject line &ldquo;Dispute Notice&rdquo;.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you of material changes by
              email or by posting a notice on our website at least 14 days before they take
              effect. Continued use of the Service after the effective date constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2>11. Contact</h2>
            <address style={{ fontStyle: 'normal', lineHeight: 2 }}>
              <strong>Cognity Pty Ltd</strong><br />
              Victoria, Australia<br />
              Email: <a href="mailto:support@cognity.com.au">support@cognity.com.au</a>
            </address>
          </section>

        </div>
      </div>

      <style>{`
        .prose-cog h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--void);
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .prose-cog h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--void);
          margin: 16px 0 8px;
        }
        .prose-cog p {
          font-size: 15px;
          line-height: 1.75;
          margin-bottom: 12px;
        }
        .prose-cog ul {
          list-style: disc;
          padding-left: 20px;
          font-size: 14px;
          line-height: 2;
          margin-bottom: 12px;
        }
        .prose-cog a {
          color: var(--purple);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-cog address {
          background: var(--mist);
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 12px;
        }
      `}</style>
    </main>
  )
}
