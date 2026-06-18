import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "c:\\Users\\Pratham K Chandra\\Desktop\\Road Track\\road-track\\.env" });

async function run() {
  try {
    console.log('SMTP_HOST=', process.env.SMTP_HOST);
    console.log('SMTP_PORT=', process.env.SMTP_PORT);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("Verifying transporter...\n");
    await transporter.verify();
    console.log("SMTP connection verified successfully.");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: "Road Track SMTP test",
      text: `Test email from Road Track at ${new Date().toISOString()}`,
    });

    console.log("Message sent:", info.messageId || info);
  } catch (err) {
    console.error("SMTP test failed:", err);
    process.exitCode = 1;
  }
}

run();
