import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

// Load production env
const envContent = readFileSync("/tmp/check-env.txt", "utf8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)="?(.+?)"?\s*$/);
  if (match) process.env[match[1]] = match[2];
}

const prisma = new PrismaClient();

async function main() {
  const r1 = await prisma.user.updateMany({
    where: { role: { in: ["EDITOR", "SUB_EDITOR", "REVIEWER"] } },
    data: { emailVerified: true }
  });
  console.log(`Fixed ${r1.count} editor/sub-editor/reviewer accounts`);

  const users = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "SUB_EDITOR", "REVIEWER"] } },
    select: { email: true, role: true, emailVerified: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
