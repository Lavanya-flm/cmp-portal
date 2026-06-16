import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../core/logger';

// ─── Resend client (lazy — only used when API key is present) ─────────────────

function isEmailEnabled(): boolean {
  const k = env.email.resendApiKey;
  return Boolean(k) && k !== 're_your_api_key_here' && k !== 'RESEND_NOT_CONFIGURED';
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(env.email.resendApiKey);
  return _resend;
}

// ─── HTML template ────────────────────────────────────────────────────────────

function passwordResetHtml(
  resetUrl: string,
  firstName: string,
  expiresMinutes: number,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your CMP Portal Password</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FFF9F1;margin:0;padding:40px 20px;color:#111827}
    .wrapper{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden}
    .header{background:#F59E0B;padding:24px 32px;display:flex;align-items:center;gap:12px}
    .logo-mark{width:36px;height:36px;background:rgba(255,255,255,.25);border-radius:10px;display:flex;align-items:center;justify-content:center}
    .header-title{color:#fff;font-size:16px;font-weight:600}
    .body{padding:32px}
    h1{font-size:21px;font-weight:600;color:#111827;margin:0 0 6px}
    p{font-size:15px;line-height:1.65;color:#6B7280;margin:0 0 18px}
    .btn{display:inline-block;background:#F59E0B;color:#fff!important;font-size:15px;font-weight:600;padding:13px 30px;border-radius:10px;text-decoration:none;letter-spacing:.01em}
    hr{border:none;border-top:1px solid #E5E7EB;margin:26px 0}
    .note{font-size:13px;color:#9CA3AF;line-height:1.6;margin:0 0 12px}
    .url-box{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;font-size:12px;font-family:monospace;color:#6B7280;word-break:break-all}
    .footer{padding:18px 32px;background:#F9FAFB;border-top:1px solid #E5E7EB}
    .footer p{font-size:12px;color:#9CA3AF;margin:0}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
      </div>
      <span class="header-title">CMP Portal</span>
    </div>

    <div class="body">
      <h1>Reset your password</h1>
      <p>Hi ${firstName},</p>
      <p>We received a request to reset the password for your CMP Portal account. Click the button below to choose a new password.</p>

      <a href="${resetUrl}" class="btn">Reset Password</a>

      <hr />

      <p class="note">This link expires in <strong>${expiresMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
      <p class="note">If the button does not work, copy and paste this URL into your browser:</p>
      <div class="url-box">${resetUrl}</div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} CMP Portal · All rights reserved</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class EmailService {
  /**
   * Send a password reset email.
   *
   * - If RESEND_API_KEY is configured → sends via Resend, throws on failure.
   * - If not configured → logs reset URL to console (dev fallback, never throws).
   */
  async sendPasswordResetEmail(
    toEmail: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl      = `${env.email.frontendUrl}/reset-password?token=${resetToken}`;
    const expiresMinutes = env.email.passwordResetExpiresMins;

    // ── Dev fallback ──────────────────────────────────────────────────────────
    if (!isEmailEnabled()) {
      logger.warn('📧 [DEV] Password reset email NOT sent (RESEND_API_KEY not configured)', {
        to:       toEmail,
        resetUrl,
      });
      // Succeed silently so the full flow can still be tested locally
      return;
    }

    // ── Send via Resend ───────────────────────────────────────────────────────
    logger.info('Sending password reset email', { to: toEmail });

    const { error } = await getResend().emails.send({
      from:    env.email.from,
      to:      toEmail,
      subject: 'Reset Your CMP Portal Password',
      html:    passwordResetHtml(resetUrl, firstName, expiresMinutes),
    });

    if (error) {
      logger.error('Failed to send password reset email via Resend', { error, to: toEmail });
      // Throw so auth.service can propagate a user-friendly 500
      throw new Error('Unable to send password reset email. Please try again.');
    }

    logger.info('Password reset email sent successfully', { to: toEmail });
  }
}

export const emailService = new EmailService();
