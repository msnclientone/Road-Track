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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const isLogin = purpose === "login";
  const subject = isLogin
    ? "Your Road Track login code"
    : "Your Road Track sign-up code";
  const actionText = isLogin
    ? "signing in to your account"
    : "creating your account";

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: `Your Road Track OTP is ${code}. It expires in 5 minutes. Use it only for ${actionText}.`,
    html: `<p>Your Road Track OTP is <strong>${code}</strong>.</p><p>It expires in 5 minutes. Use it only for ${actionText}.</p>`,
  });

  return { delivered: true };
}
