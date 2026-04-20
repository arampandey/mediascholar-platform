export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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
      {/* Call for Papers Banner */}
      <div className="max-w-5xl mx-auto px-4 pt-8 w-full">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div>
            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">Now Open</span>
            <h2 className="text-lg font-extrabold mb-0.5">Call for Papers — Vol. 4, Issue 1 (2026)</h2>
            <p className="text-yellow-300 font-bold text-sm">🗓 Deadline: 30 April 2026</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/call-for-papers" className="px-4 py-2 bg-white text-indigo-800 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm">Details</Link>
            <Link href="/register" className="px-4 py-2 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-800 transition-colors text-sm">Submit</Link>
          </div>
        </div>
      </div>
      <JournalClient articles={articles} />
      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
