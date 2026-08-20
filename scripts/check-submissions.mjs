import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database columns for Submission...");
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Submission';
  `);
  console.log("Columns:", cols);

  const orig = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Submission" WHERE id = 'cmombto10000213oyhkojd2wi';
  `);
  console.log("Original submission raw:", orig);

  const allRecent = await prisma.$queryRawUnsafe(`
    SELECT s.id, s.title, s.status, s."fileUrl", s."issueId", s."authorId", u.name as author_name, u.email as author_email, s."createdAt"
    FROM "Submission" s
    JOIN "User" u ON s."authorId" = u.id
    ORDER BY s."createdAt" DESC
    LIMIT 10;
  `);
  console.log("Recent submissions:", allRecent);

  const vijayaUsers = await prisma.$queryRawUnsafe(`
    SELECT id, name, email, "emailVerified", role, "createdAt"
    FROM "User"
    WHERE name ILIKE '%vijaya%' OR email ILIKE '%vijaya%';
  `);
  console.log("Vijaya users:", vijayaUsers);

  const revisions = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Revision";
  `);
  console.log("Revisions:", revisions);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
