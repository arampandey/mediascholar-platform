import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import JournalClient from "./JournalClient";

async function getPublished() {
  try {
    return await prisma.submission.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { name: true, institution: true } }, issue: { include: { volume: true } } },
    });
  } catch { return []; }
}

export default async function JournalPage() {
  const articles = await getPublished();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <JournalClient articles={articles} />
      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} MediaScholar. All rights reserved.</p>
      </footer>
    </div>
  );
}
