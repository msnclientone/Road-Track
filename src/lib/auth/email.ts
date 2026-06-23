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
