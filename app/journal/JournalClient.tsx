"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function JournalClient({ articles }: { articles: any[] }) {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    let result = [...articles];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title?.toLowerCase().includes(q) || a.abstract?.toLowerCase().includes(q) || a.author?.name?.toLowerCase().includes(q) || a.keywords?.some((k: string) => k.toLowerCase().includes(q)));
    }
    if (language !== "ALL") result = result.filter(a => a.language === language);
    if (sortBy === "newest") result.sort((a,b) => new Date(b.publishedAt||b.createdAt).getTime() - new Date(a.publishedAt||a.createdAt).getTime());
    if (sortBy === "oldest") result.sort((a,b) => new Date(a.publishedAt||a.createdAt).getTime() - new Date(b.publishedAt||b.createdAt).getTime());
    if (sortBy === "title") result.sort((a,b) => a.title.localeCompare(b.title));
    return result;
  }, [articles, search, language, sortBy]);

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Published Articles</h1>
      <p className="text-gray-500 mb-6">Open-access peer-reviewed research in media studies and communication</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author, keyword…" className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={language} onChange={e => setLanguage(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
          <option value="ALL">All Languages</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-lg font-semibold text-gray-600">No published articles yet</p>
          <p className="text-sm text-gray-400 mt-2">The first issue will appear here once published by the editorial team.</p>
          <Link href="/register" className="inline-block mt-6 px-5 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800">Submit Your Research →</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="font-semibold text-gray-600">No results found</p>
          <button onClick={() => { setSearch(""); setLanguage("ALL"); }} className="mt-3 text-sm text-indigo-700 hover:underline">Clear filters</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{filtered.length} article{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="space-y-4">
            {filtered.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900">{a.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{a.author?.name}{a.author?.institution ? ` · ${a.author.institution}` : ""}</p>
                    {a.issue && <p className="text-xs text-indigo-600 font-medium mt-1">Vol. {a.issue.volume.number} ({a.issue.volume.year}) · Issue {a.issue.number}{a.issue.title ? ` — ${a.issue.title}` : ""}</p>}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{a.abstract}</p>
                    {a.keywords?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{a.keywords.map((k: string) => <button key={k} onClick={() => setSearch(k)} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors">{k}</button>)}</div>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                      {a.doi && <span>DOI: <span className="text-gray-600 font-medium">{a.doi}</span></span>}
                      {a.publishedAt && <span>Published {new Date(a.publishedAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</span>}
                      <span className={`px-2 py-0.5 rounded-full font-medium ${a.language==="hi"?"bg-orange-100 text-orange-700":"bg-blue-100 text-blue-700"}`}>{a.language==="hi"?"हिंदी":"English"}</span>
                    </div>
                  </div>
                  {a.fileUrl && <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors">📄 PDF</a>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
