import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://road_track:road_track@localhost:5432/road_track";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const VEHICLE_PREFIX = "ROADV";
const RESORT_PREFIX = "ROADR";
const PAD_LENGTH = 4;

async function getNextId(
  prefix: string,
  fieldName: "vehicleOwnerId" | "resortOwnerId",
): Promise<string> {
  const lastUser = await (prisma.user as any).findFirst({
    where: { [fieldName]: { not: null } },
    orderBy: { [fieldName]: "desc" },
    select: { [fieldName]: true },
  });

  let nextNum = 1;
  if (lastUser?.[fieldName]) {
    const num = parseInt(lastUser[fieldName].replace(prefix, ""), 10);
    nextNum = num + 1;
  }

  return `${prefix}${String(nextNum).padStart(PAD_LENGTH, "0")}`;
}

async function main() {
  console.log("Assigning owner IDs to existing users...\n");

  const vehicleOwners = await prisma.user.findMany({
    where: {
      role: "VEHICLE_OWNER",
      vehicleOwnerId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${vehicleOwners.length} vehicle owners without IDs.`);

  for (const owner of vehicleOwners) {
    const id = await getNextId(VEHICLE_PREFIX, "vehicleOwnerId");
    await prisma.user.update({
      where: { id: owner.id },
      data: { vehicleOwnerId: id },
    });
    console.log(`  ${owner.email} -> ${id}`);
  }

  const resortOwners = await prisma.user.findMany({
    where: {
      role: "RESORT_OWNER",
      resortOwnerId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\nFound ${resortOwners.length} resort owners without IDs.`);

  for (const owner of resortOwners) {
    const id = await getNextId(RESORT_PREFIX, "resortOwnerId");
    await prisma.user.update({
      where: { id: owner.id },
      data: { resortOwnerId: id },
    });
    console.log(`  ${owner.email} -> ${id}`);
  }

  console.log("\nDone! All existing owners now have unique IDs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
