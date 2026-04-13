"use client";
import { useState } from "react";
import Link from "next/link";

type PaperData = {
  id: string;
  title: string;
  abstract: string | null;
  keywords: string[];
  doi: string | null;
  fileUrl: string | null;
  language: string;
  publishedAt: string | null;
  author: { id: string; name: string; institution: string | null; email: string } | null;
  vol: { number: number; year: number } | null;
  iss: { number: number; title: string | null } | null;
  citations: { apa: string; mla: string; chicago: string };
  pageUrl: string;
};

export default function PaperClient({ paper }: { paper: PaperData }) {
  const [citationFormat, setCitationFormat] = useState<"apa" | "mla" | "chicago">("apa");
  const [copied, setCopied] = useState(false);
  const [citePanelOpen, setCitePanelOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(paper.citations[citationFormat].replace(/\*/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareUrl = encodeURIComponent(paper.pageUrl);
  const shareTitle = encodeURIComponent(paper.title);
  const shareText = encodeURIComponent(`${paper.title} — published in Media Scholar Journal. Read here:`);

  const shareLinks = [
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: "bg-[#0077b5] hover:bg-[#005e93]",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      color: "bg-black hover:bg-gray-800",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      color: "bg-[#25d366] hover:bg-[#1daa56]",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: "bg-[#1877f2] hover:bg-[#0c5dcf]",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/archive" className="hover:text-indigo-600 transition-colors">Archive</Link>
        {paper.vol && <><span>/</span><span className="text-gray-500">Vol. {paper.vol.number} ({paper.vol.year})</span></>}
        {paper.iss && <><span>/</span><span className="text-gray-500">Issue {paper.iss.number}</span></>}
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div style={{ backgroundColor: "#1a2744" }} className="px-8 py-8 text-white">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {paper.vol && <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">Vol. {paper.vol.number} ({paper.vol.year})</span>}
            {paper.iss && <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">Issue {paper.iss.number}{paper.iss.title ? ` — ${paper.iss.title}` : ""}</span>}
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${paper.language === "hi" ? "bg-orange-400/80 text-white" : "bg-blue-400/80 text-white"}`}>
              {paper.language === "hi" ? "हिंदी" : "English"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight mb-4">{paper.title}</h1>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {paper.author ? (
              <Link href={`/author/${paper.author.id}`} className="font-medium text-white hover:text-blue-200 underline underline-offset-2 transition-colors">
                {paper.author.name}
              </Link>
            ) : (
              <span className="font-medium text-white">Unknown Author</span>
            )}
            {paper.author?.institution && <span className="text-blue-200">· {paper.author.institution}</span>}
          </div>
          {paper.publishedAt && (
            <p className="text-xs text-blue-200 mt-2">
              Published {new Date(paper.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>

        <div className="px-8 py-8">

          {/* Top CTA — View PDF */}
          {paper.fileUrl && (
            <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-indigo-900">Full Text Available</p>
                <p className="text-xs text-indigo-600 mt-0.5">Open-access · Free to read and download</p>
              </div>
              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg border border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View PDF
              </a>
            </div>
          )}

          {/* Abstract */}
          {paper.abstract && (
            <section className="mb-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Abstract</h2>
              <p className="text-gray-700 leading-relaxed text-base">{paper.abstract}</p>
            </section>
          )}

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <section className="mb-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((k: string) => (
                  <span key={k} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{k}</span>
                ))}
              </div>
            </section>
          )}

          {/* DOI */}
          {paper.doi && (
            <section className="mb-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">DOI</h2>
              <p className="text-sm text-gray-700 font-mono">{paper.doi}</p>
            </section>
          )}

          {/* Cite this Article */}
          <section className="mb-7">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setCitePanelOpen(!citePanelOpen)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Cite this Article</span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${citePanelOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {citePanelOpen && (
                <div className="p-5 bg-white">
                  {/* Format tabs */}
                  <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
                    {(["apa", "mla", "chicago"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCitationFormat(fmt)}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${citationFormat === fmt ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Citation text */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed italic mb-3">
                    {paper.citations[citationFormat].replace(/\*/g, "")}
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-indigo-700 text-white hover:bg-indigo-800"}`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Citation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Social Sharing */}
          <section className="mb-7">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Share this Article</h2>
            <div className="flex flex-wrap gap-2">
              {shareLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${s.color}`}
                >
                  {s.icon}
                  {s.name}
                </a>
              ))}
            </div>
          </section>

          {/* Bottom Download — primary CTA */}
          {paper.fileUrl && (
            <div className="flex justify-center pt-4">
              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-base shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Full PDF
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Back / forward nav */}
      <div className="mt-6 flex justify-between text-sm">
        <Link href="/archive" className="text-indigo-600 hover:underline">← Back to Archive</Link>
        <Link href="/journal" className="text-indigo-600 hover:underline">Browse All Articles →</Link>
      </div>
    </main>
  );
}
