"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Template = {
  key: string;
  label: string;
  subject: string;
  body: string;
  variables: string[];
  customised: boolean;
  updatedAt: string | null;
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch("/api/admin/email-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []));
  }, []);

  function selectTemplate(t: Template) {
    setSelected(t);
    setSubject(t.subject);
    setBody(t.body);
    setSaved(false);
    setPreview(false);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/email-templates/${selected.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    if (res.ok) {
      setSaved(true);
      // Refresh list
      const d = await fetch("/api/admin/email-templates").then((r) => r.json());
      setTemplates(d.templates || []);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleReset() {
    if (!selected) return;
    if (!confirm("Reset this template to the default? Your changes will be lost.")) return;
    setResetting(true);
    await fetch(`/api/admin/email-templates/${selected.key}`, { method: "DELETE" });
    const d = await fetch("/api/admin/email-templates").then((r) => r.json());
    setTemplates(d.templates || []);
    const refreshed = d.templates?.find((t: Template) => t.key === selected.key);
    if (refreshed) selectTemplate(refreshed);
    setResetting(false);
  }

  // Simple preview — replace {{vars}} with example values
  function renderPreview(str: string) {
    return str
      .replace(/\{\{P\}\}/g, 'style="margin:0 0 14px;font-size:14px;color:#2d3748;line-height:1.7;"')
      .replace(/\{\{BOX\}\}/g, 'style="border:1px solid #e2e8f0;border-left:3px solid #1a2744;padding:14px 18px;margin:20px 0;border-radius:4px;background:#f8fafc;"')
      .replace(/\{\{SIGN\}\}/g, 'style="margin:24px 0 0;font-size:14px;color:#2d3748;line-height:1.8;"')
      .replace(/\{\{LABEL\}\}/g, 'style="font-size:13px;color:#4a5568;"')
      .replace(/\{\{JOURNAL\}\}/g, "Media Scholar — Journal of Media Studies and Humanities")
      .replace(/\{\{EMAIL\}\}/g, "mediascholarjournal@gmail.com")
      .replace(/\{\{WEBSITE\}\}/g, "https://mediascholar.in")
      .replace(/\{\{authorName\}\}/g, "Dr. Priya Sharma")
      .replace(/\{\{reviewerName\}\}/g, "Prof. Rajesh Kumar")
      .replace(/\{\{name\}\}/g, "Dr. Priya Sharma")
      .replace(/\{\{title\}\}/g, "Media Framing and Political Discourse in Hindi News Channels")
      .replace(/\{\{score\}\}/g, "14")
      .replace(/\{\{daysLeft\}\}/g, "7")
      .replace(/\{\{deadlineDate\}\}/g, "30 April 2026")
      .replace(/\{\{deadlineDays\}\}/g, "15")
      .replace(/\{\{decisionText\}\}/g, "Accepted for Publication")
      .replace(/\{\{notes\}\}/g, "Minor grammatical corrections required in Section 3.")
      .replace(/\{\{remarks\}\}/g, "The methodology section needs strengthening.")
      .replace(/\{\{review1\}\}/g, "ACCEPT")
      .replace(/\{\{review2\}\}/g, "REJECT")
      .replace(/\{\{decision\}\}/g, "MINOR REVISION")
      .replace(/\{\{verifyUrl\}\}/g, "https://mediascholar.in/verify-email?token=example")
      .replace(/\{\{resetUrl\}\}/g, "https://mediascholar.in/reset-password?token=example");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/editor" className="text-sm text-indigo-600 hover:underline">← Editor Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">Email Templates</h1>
        </div>

        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Left panel — template list */}
          <div className="w-72 shrink-0 bg-white rounded-xl border border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Email Templates</p>
              <p className="text-xs text-gray-400 mt-1">{templates.length} templates</p>
            </div>
            <div className="divide-y divide-gray-100">
              {templates.map((t) => (
                <button
                  key={t.key}
                  onClick={() => selectTemplate(t)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.key === t.key ? "bg-indigo-50 border-r-2 border-indigo-600" : ""}`}
                >
                  <p className="text-sm font-medium text-gray-800 leading-snug">{t.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {t.customised ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Customised</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel — editor */}
          {selected ? (
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-bold text-gray-900">{selected.label}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Available variables:{" "}
                    {selected.variables.map((v) => (
                      <code key={v} className="bg-gray-100 text-indigo-700 px-1 py-0.5 rounded text-xs mx-0.5">{`{{${v}}}`}</code>
                    ))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(!preview)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${preview ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {preview ? "Edit" : "Preview"}
                  </button>
                  {selected.customised && (
                    <button
                      onClick={handleReset}
                      disabled={resetting}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      {resetting ? "Resetting…" : "Reset to Default"}
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${saved ? "bg-green-600 text-white" : "bg-indigo-700 text-white hover:bg-indigo-800"}`}
                  >
                    {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Subject Line</label>
                  {preview ? (
                    <p className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">{renderPreview(subject)}</p>
                  ) : (
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                {/* Body */}
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Email Body {!preview && <span className="text-gray-400 font-normal normal-case">(HTML supported)</span>}
                  </label>
                  {preview ? (
                    <div
                      className="border border-gray-200 rounded-lg overflow-hidden"
                      style={{ minHeight: "400px" }}
                    >
                      {/* Email preview wrapper */}
                      <div style={{ background: "#f9fafb", padding: "24px" }}>
                        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
                          <div style={{ background: "#1a2744", padding: "20px 24px", borderRadius: "6px 6px 0 0" }}>
                            <p style={{ margin: 0, color: "#fff", fontSize: "15px", fontWeight: "bold" }}>Media Scholar — Journal of Media Studies and Humanities</p>
                            <p style={{ margin: "4px 0 0", color: "#a0aec0", fontSize: "11px" }}>ISSN: 3048-5029 | https://mediascholar.in</p>
                          </div>
                          <div
                            style={{ background: "#fff", padding: "28px 24px", border: "1px solid #e2e8f0", borderTop: "none" }}
                            dangerouslySetInnerHTML={{ __html: renderPreview(body) }}
                          />
                          <div style={{ background: "#f1f5f9", padding: "14px 24px", border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 6px 6px" }}>
                            <p style={{ margin: 0, fontSize: "11px", color: "#718096" }}>Media Scholar — Journal of Media Studies and Humanities<br />Galgotias University, Greater Noida<br />mediascholarjournal@gmail.com | +91 9911893074</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={18}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">✉️</div>
                <p className="font-semibold text-gray-600">Select a template to edit</p>
                <p className="text-sm text-gray-400 mt-1">Click any template from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
