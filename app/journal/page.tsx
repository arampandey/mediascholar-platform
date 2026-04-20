export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Current Issue | Media Scholar — Journal of Media Studies and Humanities",
  description: "Browse the current issue of Media Scholar journal. Peer-reviewed research in media studies, journalism, and communication. ISSN: 3048-5029.",
  alternates: { canonical: "https://mediascholar.in/journal" },
};
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
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
