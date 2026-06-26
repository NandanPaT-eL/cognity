import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'Cognity <noreply@cognity.com.au>'

// ─── Welcome email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, orgName: string): Promise<void> {
  await resend.emails.send({
    from:    FROM_ADDRESS,
    to,
    subject: 'Welcome to Cognity — your onboarding AI is ready',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.03em;">cognity</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1a1a2e;letter-spacing:-0.03em;">
              Welcome, ${orgName}!
            </h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
              Your Cognity workspace is live. Here's how to get started in the next 5 minutes:
            </p>
            <ol style="margin:0 0 32px;padding-left:20px;font-size:14px;line-height:2;color:#374151;">
              <li>Upload your product docs in the <strong>Documentation</strong> tab</li>
              <li>Set your activation goal in the <strong>Activation Goal</strong> tab</li>
              <li>Copy your install snippet from the <strong>Install</strong> tab and paste it into your app</li>
            </ol>
            <a href="https://cognity.com.au/dashboard"
               style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:50px;">
              Open your dashboard →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0eeff;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Questions? Reply to this email or write to
              <a href="mailto:support@cognity.com.au" style="color:#7c3aed;">support@cognity.com.au</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// ─── Payment failed email ────────────────────────────────────────────────────

export async function sendPaymentFailedEmail(to: string): Promise<void> {
  await resend.emails.send({
    from:    FROM_ADDRESS,
    to,
    subject: 'Action required: your Cognity payment failed',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.03em;">cognity</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#dc2626;letter-spacing:-0.03em;">
              Payment failed
            </h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
              We were unable to process your Cognity subscription payment. To keep your workspace active,
              please update your billing details within the next 7 days.
            </p>
            <a href="https://cognity.com.au/dashboard"
               style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:50px;">
              Update billing →
            </a>
            <p style="margin:32px 0 0;font-size:13px;color:#6b7280;">
              If you believe this is an error, contact us at
              <a href="mailto:support@cognity.com.au" style="color:#7c3aed;">support@cognity.com.au</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0eeff;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Cognity · cognity.com.au</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// ─── Limit warning email ─────────────────────────────────────────────────────

export async function sendLimitWarningEmail(
  to: string,
  orgName: string,
  usedPct: number
): Promise<void> {
  const pct = Math.round(usedPct)
  await resend.emails.send({
    from:    FROM_ADDRESS,
    to,
    subject: `Heads up: you've used ${pct}% of your Cognity plan limits`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.03em;">cognity</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#d97706;letter-spacing:-0.03em;">
              You're at ${pct}% of your plan limit
            </h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
              Hi ${orgName}, your workspace has used <strong>${pct}%</strong> of its monthly limits.
              Upgrade now to avoid hitting the cap and interrupting your users' experience.
            </p>
            <a href="https://cognity.com.au/#pricing"
               style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:50px;">
              Upgrade plan →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0eeff;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Cognity · cognity.com.au</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// ─── Plan downgraded email ────────────────────────────────────────────────────

export async function sendPlanDowngradedEmail(to: string): Promise<void> {
  await resend.emails.send({
    from:    FROM_ADDRESS,
    to,
    subject: 'Your Cognity plan has been changed to Free',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.03em;">cognity</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;letter-spacing:-0.03em;">
              Your plan has been changed to Free
            </h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;">
              Your Cognity subscription was cancelled or your payment could not be processed,
              so your workspace has been moved to the Free plan.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
              You can resubscribe at any time to restore full access to your triggers,
              MAU allowance, and documents.
            </p>
            <a href="https://cognity.com.au/#pricing"
               style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:50px;">
              View plans →
            </a>
            <p style="margin:32px 0 0;font-size:13px;color:#6b7280;">
              Questions? Contact us at
              <a href="mailto:support@cognity.com.au" style="color:#7c3aed;">support@cognity.com.au</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0eeff;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Cognity · cognity.com.au</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
