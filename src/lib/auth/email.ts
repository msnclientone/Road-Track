import nodemailer from "nodemailer";

type SendOtpEmailInput = {
  to: string;
  code: string;
  purpose?: "signup" | "login";
};

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

export async function sendOtpEmail({
  to,
  code,
  purpose = "signup",
}: SendOtpEmailInput): Promise<{ delivered: boolean; devCode?: string }> {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[Road Track OTP] ${to}: ${code}`);
      return { delivered: false, devCode: code };
    }

    throw new Error("SMTP is not configured.");
  }
  const configuredPort = Number(process.env.SMTP_PORT ?? 0) || undefined;
  const tryPorts = Array.from(new Set([configuredPort, 465, 2525].filter(Boolean)));

  const isLogin = purpose === "login";
  const subject = isLogin
    ? "Your Road Track login code"
    : "Your Road Track sign-up code";
  const actionText = isLogin
    ? "signing in to your account"
    : "creating your account";

  // Try each port until one succeeds
  let lastError: unknown = null;
  for (const port of tryPorts) {
    const secure = port === 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text: `Your Road Track OTP is ${code}. It expires in 5 minutes. Use it only for ${actionText}.`,
        html: `<p>Your Road Track OTP is <strong>${code}</strong>.</p><p>It expires in 5 minutes. Use it only for ${actionText}.</p>`,
      });

      return { delivered: true };
    } catch (err) {
      // record and try next port
      // eslint-disable-next-line no-console
      console.warn(`SMTP send failed on port ${port}:`, err);
      lastError = err;
    }
  }

  // If we reach here, all attempts failed. Surface the last error.
  throw lastError;
}

type SendPasswordResetEmailInput = {
  to: string;
  resetLink: string;
};

export async function sendPasswordResetEmail({
  to,
  resetLink,
}: SendPasswordResetEmailInput): Promise<{ delivered: boolean; devLink?: string }> {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[Road Track Reset] ${to}: ${resetLink}`);
      return { delivered: false, devLink: resetLink };
    }
    throw new Error("SMTP is not configured.");
  }

  const configuredPort = Number(process.env.SMTP_PORT ?? 0) || undefined;
  const tryPorts = Array.from(new Set([configuredPort, 465, 2525].filter(Boolean)));

  let lastError: unknown = null;
  for (const port of tryPorts) {
    const secure = port === 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;padding:40px 16px">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%">
<tr><td style="background-color:#1a1a1a;border-radius:16px 16px 0 0;padding:32px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px">Road Track</h1>
<p style="margin:4px 0 0;font-size:14px;color:#ffffff;opacity:0.7">Reset Your Password</p>
</td></tr>
<tr><td style="background-color:#ffffff;border-radius:0 0 16px 16px;padding:40px 32px">
<h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#1a1a1a">Password Reset Request</h2>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#666666">We received a request to reset the password for your Road Track account. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px">
<tr><td style="background-color:#e96f5a;border-radius:8px;padding:14px 32px;text-align:center">
<a href="${resetLink}" style="color:#1a1a1a;font-size:15px;font-weight:900;text-decoration:none;display:inline-block">Reset Password</a>
</td></tr>
</table>
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#999999">Or copy this link into your browser:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#f5f3ef;border-radius:8px;padding:12px 16px;word-break:break-all;font-size:12px;color:#666666;font-family:monospace">${resetLink}</td></tr></table>
<hr style="margin:24px 0;border:none;border-top:1px solid #e5e2dc">
<p style="margin:0;font-size:13px;line-height:1.5;color:#999999">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: "Reset Your Road Track Password",
        text: `Reset your Road Track password by visiting: ${resetLink}. This link expires in 15 minutes. If you did not request this, ignore this email.`,
        html,
      });
      return { delivered: true };
    } catch (err) {
      console.warn(`SMTP send failed on port ${port}:`, err);
      lastError = err;
    }
  }

  throw lastError;
}
