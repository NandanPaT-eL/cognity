import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Cognity',
  description: 'How Cognity collects, uses, and protects your data. Australian Privacy Principles compliant.',
  alternates: { canonical: 'https://cognity.com.au/privacy' },
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-[15px]" style={{ color: 'var(--text-soft)' }}>
            Last updated: 25 June 2026 &nbsp;·&nbsp; Effective immediately
          </p>
        </div>

        <div className="prose-cog space-y-10" style={{ color: 'var(--text-soft)' }}>

          {/* 1 — Introduction */}
          <section>
            <h2>1. About Cognity</h2>
            <p>
              Cognity (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an AI-powered
              onboarding platform operated by Cognity Pty Ltd, registered in Victoria, Australia.
              This Privacy Policy explains how we collect, use, disclose, and protect personal
              information when you use our service at{' '}
              <a href="https://cognity.com.au">cognity.com.au</a> and our API
              (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              We comply with the <strong>Privacy Act 1988</strong> (Cth) and the
              <strong> Australian Privacy Principles</strong> (APPs), and where applicable the
              EU&nbsp;<strong>General Data Protection Regulation</strong> (GDPR).
            </p>
          </section>

          {/* 2 — Data collected */}
          <section>
            <h2>2. Data We Collect</h2>
            <p>We collect the following categories of data:</p>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Examples</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account data</td>
                  <td>Name, email address, organisation name</td>
                  <td>You, at sign-up via Clerk</td>
                </tr>
                <tr>
                  <td>Chat messages</td>
                  <td>User questions and AI responses within onboarding sessions</td>
                  <td>Your end users, via the SDK</td>
                </tr>
                <tr>
                  <td>Anonymised user IDs</td>
                  <td>
                    Hashed, opaque identifiers (never plain email / name) used to count
                    monthly active users
                  </td>
                  <td>Your application, via the SDK</td>
                </tr>
                <tr>
                  <td>Page paths</td>
                  <td>URL paths where onboarding events occurred (e.g. <code>/onboarding/step-2</code>)</td>
                  <td>Your end users, via the SDK</td>
                </tr>
                <tr>
                  <td>Document content</td>
                  <td>Product documentation you upload for AI training</td>
                  <td>You, via the dashboard</td>
                </tr>
                <tr>
                  <td>Billing data</td>
                  <td>Subscription status, last-4 of card (held by Stripe, not us)</td>
                  <td>Stripe</td>
                </tr>
                <tr>
                  <td>Usage data</td>
                  <td>Trigger counts, MAU counts per billing month</td>
                  <td>Automatically generated</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 3 — How we use data */}
          <section>
            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To provide and operate the Service (AI onboarding conversations)</li>
              <li>To enforce plan limits and process billing via Stripe</li>
              <li>To send transactional emails (welcome, payment alerts, limit warnings)</li>
              <li>To generate anonymised analytics about onboarding performance</li>
              <li>To detect abuse and maintain security</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>
              We do <strong>not</strong> sell or share your personal data or your end-users&apos;
              data with third parties for advertising purposes.
            </p>
          </section>

          {/* 4 — Sub-processors */}
          <section>
            <h2>4. Sub-Processors</h2>
            <p>
              We rely on the following third-party sub-processors. Each is bound by their own
              privacy and data-processing terms.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Sub-processor</th>
                  <th>Purpose</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Google (Gemini)</strong></td>
                  <td>AI language model for onboarding conversations</td>
                  <td>USA</td>
                </tr>
                <tr>
                  <td><strong>Pinecone</strong></td>
                  <td>Vector database for document embeddings</td>
                  <td>USA</td>
                </tr>
                <tr>
                  <td><strong>Neon</strong></td>
                  <td>Serverless PostgreSQL database</td>
                  <td>USA</td>
                </tr>
                <tr>
                  <td><strong>Clerk</strong></td>
                  <td>Authentication and user management</td>
                  <td>USA</td>
                </tr>
                <tr>
                  <td><strong>Upstash Redis</strong></td>
                  <td>Rate-limiting and short-term caching</td>
                  <td>USA / EU</td>
                </tr>
                <tr>
                  <td><strong>Vercel</strong></td>
                  <td>Dashboard hosting and edge network</td>
                  <td>USA / Global</td>
                </tr>
                <tr>
                  <td><strong>Stripe</strong></td>
                  <td>Payment processing and subscription management</td>
                  <td>USA</td>
                </tr>
                <tr>
                  <td><strong>Resend</strong></td>
                  <td>Transactional email delivery</td>
                  <td>USA</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 5 — Retention */}
          <section>
            <h2>5. Data Retention</h2>
            <ul>
              <li>
                <strong>Chat sessions and messages:</strong> retained for 24 months from the
                date of creation, then permanently deleted.
              </li>
              <li>
                <strong>Activity events and page paths:</strong> retained for 24 months.
              </li>
              <li>
                <strong>Anonymised MAU records:</strong> retained for 24 months for billing
                audit purposes.
              </li>
              <li>
                <strong>Uploaded documents:</strong> retained until you delete them from
                the dashboard, or until your account is closed.
              </li>
              <li>
                <strong>Account data:</strong> retained while your account is active and
                for up to 30 days after closure (to support recovery).
              </li>
            </ul>
            <p>
              You may request deletion of your data at any time by emailing{' '}
              <a href="mailto:privacy@cognity.com.au">privacy@cognity.com.au</a>.
            </p>
          </section>

          {/* 6 — APPs compliance */}
          <section>
            <h2>6. Australian Privacy Principles</h2>
            <p>
              We comply with the 13 Australian Privacy Principles under the Privacy Act 1988 (Cth),
              including:
            </p>
            <ul>
              <li><strong>APP 1:</strong> We have this open and transparent Privacy Policy.</li>
              <li><strong>APP 3:</strong> We only collect data that is reasonably necessary.</li>
              <li>
                <strong>APP 6:</strong> We use personal information only for the primary purpose
                for which it was collected, or with your consent.
              </li>
              <li>
                <strong>APP 8:</strong> When we disclose data to overseas sub-processors, we take
                reasonable steps to ensure they uphold comparable privacy protections.
              </li>
              <li>
                <strong>APP 11:</strong> We take reasonable technical and organisational measures
                to protect personal information from misuse, interference, loss, and unauthorised
                access or disclosure.
              </li>
              <li>
                <strong>APP 12 &amp; 13:</strong> You can request access to, or correction of,
                your personal information by contacting us.
              </li>
            </ul>
          </section>

          {/* 7 — GDPR */}
          <section>
            <h2>7. GDPR Rights (EU/EEA Users)</h2>
            <p>If you are located in the EU or EEA, you have the following additional rights:</p>
            <ul>
              <li>
                <strong>Right of access:</strong> request a copy of the personal data we hold
                about you.
              </li>
              <li>
                <strong>Right to erasure:</strong> request deletion of your personal data
                (&ldquo;right to be forgotten&rdquo;).
              </li>
              <li>
                <strong>Right to data portability:</strong> receive your data in a
                machine-readable format.
              </li>
              <li>
                <strong>Right to rectification:</strong> request correction of inaccurate data.
              </li>
              <li>
                <strong>Right to restriction:</strong> request that we restrict processing of
                your data.
              </li>
              <li>
                <strong>Right to object:</strong> object to processing based on legitimate
                interests.
              </li>
            </ul>
            <p>
              To exercise any right, email{' '}
              <a href="mailto:privacy@cognity.com.au">privacy@cognity.com.au</a>. We will
              respond within 30 days.
            </p>
          </section>

          {/* 8 — Cookies */}
          <section>
            <h2>8. Cookies and Tracking</h2>
            <p>
              Our website uses a single first-party cookie (<code>cog_cookie_ok</code>) to
              remember your cookie notice preference. We do not use third-party tracking or
              advertising cookies. Authentication cookies are set by Clerk.
            </p>
          </section>

          {/* 9 — Security */}
          <section>
            <h2>9. Security</h2>
            <p>
              We implement industry-standard security measures including TLS encryption in
              transit, hashed API keys, and access controls. No method of transmission over the
              internet is 100% secure; we cannot guarantee absolute security.
            </p>
          </section>

          {/* 10 — Contact */}
          <section>
            <h2>10. Contact Us</h2>
            <p>
              For privacy enquiries, access requests, or complaints, contact our Privacy
              Officer at:
            </p>
            <address style={{ fontStyle: 'normal', lineHeight: 2 }}>
              <strong>Cognity Pty Ltd</strong><br />
              Email: <a href="mailto:privacy@cognity.com.au">privacy@cognity.com.au</a><br />
              Victoria, Australia
            </address>
            <p>
              If you are not satisfied with our response, you may lodge a complaint with the
              Office of the Australian Information Commissioner (OAIC) at{' '}
              <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
                oaic.gov.au
              </a>.
            </p>
          </section>

          {/* 11 — Changes */}
          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              material changes by email (to your registered address) or by posting a prominent
              notice on our website. Continued use of the Service after the effective date
              constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>
      </div>

      <style>{`
        .prose-cog h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--void);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
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
        .prose-cog table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .prose-cog th {
          text-align: left;
          padding: 8px 12px;
          font-weight: 600;
          color: var(--void);
          background: var(--mist);
          border: 1px solid rgba(14,11,26,0.08);
        }
        .prose-cog td {
          padding: 8px 12px;
          vertical-align: top;
          border: 1px solid rgba(14,11,26,0.08);
          line-height: 1.6;
        }
        .prose-cog code {
          font-family: monospace;
          font-size: 12px;
          background: var(--mist);
          padding: 1px 5px;
          border-radius: 4px;
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
