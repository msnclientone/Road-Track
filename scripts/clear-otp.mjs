import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: "c:\\Users\\Pratham K Chandra\\Desktop\\Road Track\\road-track\\.env" });

const prisma = new PrismaClient();

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/clear-otp.mjs user@example.com");
    process.exit(1);
  }

  const normalized = email.toLowerCase();
  try {
    const result = await prisma.otpCode.deleteMany({ where: { email: normalized } });
    console.log(`Deleted ${result.count} OTP record(s) for ${normalized}`);
  } catch (err) {
    console.error("Failed to clear OTP records:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
