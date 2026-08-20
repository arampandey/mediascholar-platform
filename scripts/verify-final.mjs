import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const origId = "cmombto10000213oyhkojd2wi";
  console.log("=== Verifying Final Database State ===");

  const sub = await prisma.submission.findUnique({
    where: { id: origId },
    include: {
      author: true,
      issue: { include: { volume: true } },
      revisions: true,
      reviews: { include: { reviewer: true } },
    },
  });

  console.log("Submission ID:", sub.id);
  console.log("Title:", sub.title);
  console.log("Author:", `${sub.author.name} (${sub.author.email})`);
  console.log("Status:", sub.status);
  console.log("File URL:", sub.fileUrl);
  console.log("Issue:", `Vol. ${sub.issue.volume.number} (${sub.issue.volume.year}), ${sub.issue.title}`);
  console.log("Revisions count:", sub.revisions.length);
  console.log("Revisions:", sub.revisions);
  console.log("Reviews count:", sub.reviews.length);

  const duplicateCheck = await prisma.submission.findMany({
    where: {
      OR: [
        { id: "cmsu1owir0001a8t4sddxvvyu" },
        { author: { email: "vijayab1911@gmail.com" } },
      ],
    },
  });
  console.log("Duplicate submissions remaining:", duplicateCheck.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
