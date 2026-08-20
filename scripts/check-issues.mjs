import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const issues = await prisma.issue.findMany({
    include: { volume: true },
    orderBy: [{ volume: { number: "asc" } }, { number: "asc" }],
  });
  console.log("All issues in DB:");
  for (const i of issues) {
    console.log({
      id: i.id,
      volNumber: i.volume.number,
      volYear: i.volume.year,
      number: i.number,
      title: i.title,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
