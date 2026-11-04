"use client";
import { useEffect, useState } from "react";

type English = {
  titleEn: string;
  abstractEn: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED";
  authorNote: string | null;
} | null;

const BADGE: Record<string, { label: string; cls: string }> = {
  PENDING_APPROVAL: { label: "Waiting for author approval", cls: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved by author", cls: "bg-green-100 text-green-700" },
  CHANGES_REQUESTED: { label: "Author asked for changes", cls: "bg-orange-100 text-orange-700" },
};

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

// English title + abstract for Hindi papers (needed for Scopus / DOAJ).
// mode "editor": the editor writes it and sends it to the author for approval.
// mode "author": the author approves it or asks for changes.
export default function EnglishVersionPanel({ submissionId, mode }: { submissionId: string; mode: "editor" | "author" }) {
  const [english, setEnglish] = useState<English>(null);
  const [loaded, setLoaded] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [abstractEn, setAbstractEn] = useState("");
  const [note, setNote] = useState("");
  const [askChanges, setAskChanges] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    fetch(`/api/submissions/${submissionId}/english`)
      .then((r) => r.json())
      .then((d) => {
        const e: English = d.english || null;
        setEnglish(e);
        if (e) { setTitleEn(e.titleEn); setAbstractEn(e.abstractEn); }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }
  useEffect(() => { load(); }, [submissionId]);

  async function send() {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/submissions/${submissionId}/english`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleEn, abstractEn }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: d.error || "Could not save." }); return; }
    setMsg({ ok: true, text: d.emailed ? "Sent to the author for approval." : "Saved. The author has no real email address on file, so ask them to log in and approve it." });
    load();
  }

  async function respond(action: "approve" | "changes") {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/submissions/${submissionId}/english`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: d.error || "Could not save." }); return; }
    setAskChanges(false); setNote("");
    setMsg({ ok: true, text: action === "approve" ? "Thank you, the English title and abstract are approved." : "Your request has been sent to the editorial office." });
    load();
  }

  if (!loaded) return null;
  // Authors only see this card once the editorial office has prepared something.
  if (mode === "author" && !english) return null;

  const badge = english ? BADGE[english.status] : null;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 mb-4">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <h3 className="font-bold text-gray-900 text-sm">English title and abstract (Hindi paper)</h3>
        {badge && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>}
      </div>

      {mode === "editor" && (
        <>
          <p className="text-xs text-gray-500 mb-3">
            Needed for international indexing. The paper stays in Hindi. The author is asked to approve this before it is shown anywhere.
          </p>
          {english?.status === "CHANGES_REQUESTED" && english.authorNote && (
            <div className="text-sm bg-orange-50 border border-orange-200 text-orange-800 rounded-lg px-3 py-2 mb-3">
              <strong>Author&apos;s requested changes:</strong> {english.authorNote}
            </div>
          )}
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="English title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <textarea value={abstractEn} onChange={(e) => setAbstractEn(e.target.value)} rows={6} placeholder="English abstract (about 150 to 250 words)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-400">{wordCount(abstractEn)} words</span>
            <button onClick={send} disabled={busy || !titleEn.trim() || !abstractEn.trim()}
              className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800 disabled:opacity-40">
              {busy ? "Sending…" : english ? "Update and send to author again" : "Send to author for approval"}
            </button>
          </div>
        </>
      )}

      {mode === "author" && english && (
        <>
          <p className="text-xs text-gray-500 mb-3">
            The journal needs an English title and abstract for international indexing. Your paper stays in Hindi.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 space-y-2">
            <p><strong>English title:</strong> {english.titleEn}</p>
            <p className="whitespace-pre-line"><strong>English abstract:</strong> {english.abstractEn}</p>
          </div>
          {english.status === "PENDING_APPROVAL" && (
            askChanges ? (
              <div className="mt-3 space-y-2">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What should be changed?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="flex gap-2">
                  <button onClick={() => respond("changes")} disabled={busy || !note.trim()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-40">Send request</button>
                  <button onClick={() => { setAskChanges(false); setNote(""); }} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2 flex-wrap">
                <button onClick={() => respond("approve")} disabled={busy}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">{busy ? "Saving…" : "Approve"}</button>
                <button onClick={() => setAskChanges(true)} disabled={busy}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Ask for changes</button>
              </div>
            )
          )}
          {english.status === "CHANGES_REQUESTED" && (
            <p className="text-xs text-gray-500 mt-3">You asked for changes. The editorial office will update it and ask you again.</p>
          )}
        </>
      )}

      {msg && <p className={`text-xs mt-2 ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
