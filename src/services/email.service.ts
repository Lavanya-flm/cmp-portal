import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../core/logger';

// ─── Client (lazy singleton) ──────────────────────────────────────────────────

let _resend: Resend | null = null;

function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(env.email.resendApiKey);
  }
  return _resend;
}

// ─── HTML email template ──────────────────────────────────────────────────────

function buildPasswordResetHtml(firstName: string, resetLink: string): string {
  const expiryMins = env.email.passwordResetExpiresMins;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#f59e0b;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Frontlines Edutech
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                We received a request to reset the password for your CMP Portal account.
                Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:8px;background:#f59e0b;">
                    <a href="${resetLink}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.5;">
                This link will expire in <strong>${expiryMins} minutes</strong>.
                If you did not request a password reset, you can safely ignore this email —
                your password will remain unchanged.
              </p>

              <p style="margin:0;font-size:13px;color:#9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${resetLink}" style="color:#f59e0b;word-break:break-all;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Frontlines Edutech · CMP Portal<br />
                You received this email because a password reset was requested for your account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

// ─── Email service ────────────────────────────────────────────────────────────

export class EmailService {
  /**
   * Send a password reset email via Resend.
   *
   * Failures are logged but NOT re-thrown so the caller always returns
   * a success response — this prevents leaking whether the send succeeded.
   *
   * @returns true if sent, false if sending failed (API key missing / Resend error)
   */
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetLink: string,
  ): Promise<boolean> {
    const key = env.email.resendApiKey;
    const isPlaceholder = !key || key === 're_your_api_key_here' || key.startsWith('re_your');

    if (isPlaceholder) {
      logger.warn('[Email] Skipping password reset email — RESEND_API_KEY not configured', { to });
      return false;
    }

    try {
      const resend = getResendClient();

      const { error } = await resend.emails.send({
        from:    env.email.from,
        to:      [to],
        subject: 'Reset Your Password – Frontlines Edutech',
        html:    buildPasswordResetHtml(firstName, resetLink),
      });

      if (error) {
        logger.error('[Email] Resend API returned an error', { to, error: error.message });
        return false;
      }

      logger.info('[Email] Password reset email sent', { to });
      return true;
    } catch (err) {
      // Never expose Resend internals to the caller
      logger.error('[Email] Failed to send password reset email', {
        to,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }
}

export const emailService = new EmailService();
