import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Original Submission Details ===");
  const orig = await prisma.$queryRawUnsafe(`
    SELECT s.*, u.name as author_name, u.email as author_email, u.role as author_role,
           i.number as issue_number, i.title as issue_title, v.number as vol_number, v.year as vol_year
    FROM "Submission" s
    JOIN "User" u ON s."authorId" = u.id
    LEFT JOIN "Issue" i ON s."issueId" = i.id
    LEFT JOIN "Volume" v ON i."volumeId" = v.id
    WHERE s.id = 'cmombto10000213oyhkojd2wi';
  `);
  console.log(JSON.stringify(orig, null, 2));

  console.log("\n=== Duplicate New Submission Details ===");
  const dup = await prisma.$queryRawUnsafe(`
    SELECT s.*, u.name as author_name, u.email as author_email, u.role as author_role,
           i.number as issue_number, i.title as issue_title, v.number as vol_number, v.year as vol_year
    FROM "Submission" s
    JOIN "User" u ON s."authorId" = u.id
    LEFT JOIN "Issue" i ON s."issueId" = i.id
    LEFT JOIN "Volume" v ON i."volumeId" = v.id
    WHERE s.id = 'cmsu1owir0001a8t4sddxvvyu';
  `);
  console.log(JSON.stringify(dup, null, 2));

  console.log("\n=== Reviews for Original Submission ===");
  const reviews = await prisma.$queryRawUnsafe(`
    SELECT r.*, u.name as reviewer_name, u.email as reviewer_email
    FROM "Review" r
    JOIN "User" u ON r."reviewerId" = u.id
    WHERE r."submissionId" = 'cmombto10000213oyhkojd2wi';
  `);
  console.log(JSON.stringify(reviews, null, 2));

  console.log("\n=== Assigned Reviewers for Original Submission ===");
  const reviewers = await prisma.$queryRawUnsafe(`
    SELECT sr.*, u.name as reviewer_name, u.email as reviewer_email
    FROM "SubmissionReviewer" sr
    JOIN "User" u ON sr."userId" = u.id
    WHERE sr."submissionId" = 'cmombto10000213oyhkojd2wi';
  `);
  console.log(JSON.stringify(reviewers, null, 2));

  console.log("\n=== Existing Revisions for Original Submission ===");
  const revs = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Revision" WHERE "submissionId" = 'cmombto10000213oyhkojd2wi';
  `);
  console.log(JSON.stringify(revs, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
