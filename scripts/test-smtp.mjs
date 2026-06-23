import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "c:\\Users\\Pratham K Chandra\\Desktop\\Road Track\\road-track\\.env" });

const PORTS_TO_TEST = [587, 465, 2525, 25];

async function tryPort(port) {
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
    process.stdout.write(`Testing ${process.env.SMTP_HOST}:${port} (secure=${secure})... `);
    await transporter.verify();
    console.log("OK");
    return { port, ok: true };
  } catch (err) {
    console.log("FAILED");
    return { port, ok: false, error: err };
  }
}

async function runAll() {
  if (!process.env.SMTP_HOST) {
    console.error("SMTP_HOST not set in .env");
    process.exitCode = 1;
    return;
  }

  console.log('SMTP_HOST=', process.env.SMTP_HOST);
  console.log('SMTP_USER=', process.env.SMTP_USER);

  const results = [];
  for (const port of PORTS_TO_TEST) {
    // eslint-disable-next-line no-await-in-loop
    const r = await tryPort(port);
    results.push(r);
  }

  console.log("\nSummary:");
  results.forEach((r) => {
    if (r.ok) console.log(`- ${r.port}: reachable`);
    else console.log(`- ${r.port}: not reachable (${r.error?.code ?? r.error})`);
  });

  const any = results.some((r) => r.ok);
  if (!any) process.exitCode = 1;
}

runAll();
