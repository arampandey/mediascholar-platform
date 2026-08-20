import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const origSubmissionId = "cmombto10000213oyhkojd2wi";
  const duplicateSubmissionId = "cmsu1owir0001a8t4sddxvvyu";
  const duplicateUserId = "cmsu1c6op000012by84pkk8mn";
  const revisedPdfUrl = "https://res.cloudinary.com/dzewzfak6/raw/upload/v1786778339/mediascholar/papers/1786778339366-Media_Scholar.pdf";

  console.log("Starting migration for Vijaya's revised manuscript...");

  // 1. Check original submission
  const orig = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Submission" WHERE id = $1
  `, origSubmissionId);
  console.log("Found original submission:", orig);

  if (!orig || orig.length === 0) {
    throw new Error(`Original submission ${origSubmissionId} not found!`);
  }

  // 2. Insert Revision record
  const revisionInsert = await prisma.$queryRawUnsafe(`
    INSERT INTO "Revision" (id, "submissionId", "fileUrl", notes, "createdAt")
    VALUES (
      'rev_' || substr(md5(random()::text), 1, 20),
      $1,
      $2,
      'Revised manuscript uploaded by author (attached to Vol. 4 Issue 1)',
      NOW()
    )
    RETURNING *;
  `, origSubmissionId, revisedPdfUrl);
  console.log("Created Revision record:", revisionInsert);

  // 3. Update original submission status and fileUrl
  const origUpdate = await prisma.$queryRawUnsafe(`
    UPDATE "Submission"
    SET 
      "fileUrl" = $1,
      "status" = 'RESUBMITTED'::"SubmissionStatus",
      "updatedAt" = NOW()
    WHERE id = $2
    RETURNING id, title, status, "fileUrl", "issueId";
  `, revisedPdfUrl, origSubmissionId);
  console.log("Updated original submission:", origUpdate);

  // 4. Clean up duplicate submission if it exists
  const dupCheck = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Submission" WHERE id = $1
  `, duplicateSubmissionId);
  console.log("Duplicate submission check:", dupCheck);

  if (dupCheck && dupCheck.length > 0) {
    // Delete any dependent records on duplicate submission if any
    await prisma.$queryRawUnsafe(`DELETE FROM "Review" WHERE "submissionId" = $1`, duplicateSubmissionId);
    await prisma.$queryRawUnsafe(`DELETE FROM "SubmissionReviewer" WHERE "submissionId" = $1`, duplicateSubmissionId);
    await prisma.$queryRawUnsafe(`DELETE FROM "Revision" WHERE "submissionId" = $1`, duplicateSubmissionId);
    await prisma.$queryRawUnsafe(`DELETE FROM "Submission" WHERE id = $1`, duplicateSubmissionId);
    console.log(`Deleted duplicate submission ${duplicateSubmissionId}`);
  }

  // 5. Clean up duplicate user if it exists and has no other submissions
  const dupUserSubs = await prisma.$queryRawUnsafe(`
    SELECT id FROM "Submission" WHERE "authorId" = $1
  `, duplicateUserId);
  if (!dupUserSubs || dupUserSubs.length === 0) {
    await prisma.$queryRawUnsafe(`DELETE FROM "User" WHERE id = $1`, duplicateUserId);
    console.log(`Deleted duplicate user ${duplicateUserId}`);
  }

  // 6. Verify final state of original submission and its revisions
  const finalSub = await prisma.$queryRawUnsafe(`
    SELECT s.id, s.title, s.status, s."fileUrl", s."issueId", 
           i.number as issue_number, v.number as vol_number, v.year as vol_year,
           u.name as author_name, u.email as author_email
    FROM "Submission" s
    JOIN "User" u ON s."authorId" = u.id
    LEFT JOIN "Issue" i ON s."issueId" = i.id
    LEFT JOIN "Volume" v ON i."volumeId" = v.id
    WHERE s.id = $1
  `, origSubmissionId);
  console.log("Final original submission state:", finalSub);

  const finalRevs = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Revision" WHERE "submissionId" = $1
  `, origSubmissionId);
  console.log("Final revisions for submission:", finalRevs);

  console.log("✅ Successfully updated Vijaya's revised manuscript in Vol. 4 Issue 1!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
