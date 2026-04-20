import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Submission Guidelines | Media Scholar — Journal of Media Studies and Humanities",
  description: "Comprehensive submission guidelines for Media Scholar journal — formatting requirements, peer review process, revision policy, withdrawal policy, self-archiving policy, and post-acceptance workflow. ISSN: 3048-5029.",
  alternates: { canonical: "https://mediascholar.in/guidelines" },
};

const sections = [
  {
    id: "about",
    title: "About the Journal",
    content: "Media Scholar — Journal of Media Studies and Humanities is a bi-annual, open-access, double-blind peer-reviewed bilingual journal (Hindi & English) focused on Media Studies, Mass Communication, Journalism, and related disciplines. ISSN: 3048-5029. There are no submission fees or article processing charges.",
  },
  {
    id: "who",
    title: "Who Can Submit",
    content: "Research papers and review articles from faculty members, research scholars, and media professionals are welcome. Authors must register on the platform before submitting. Both Indian and international scholars are invited to contribute.",
  },
  {
    id: "language",
    title: "Language",
    content: "Submissions are accepted in English and Hindi only. The language must be clearly specified at the time of submission. Mixed-language manuscripts are not accepted. Abstracts in both languages are encouraged but not mandatory.",
  },
  {
    id: "originality",
    title: "Originality & Ethics",
    content: "Submitted work must be original and not under simultaneous review elsewhere. Papers with more than 20% plagiarism (as detected by plagiarism screening software) will be rejected without review. Media Scholar adheres to COPE (Committee on Publication Ethics) guidelines. Any form of fabrication, falsification, or plagiarism will result in immediate rejection and notification to the author's institution.",
  },
  {
    id: "formatting",
    title: "General Formatting",
    content: "Use Times New Roman 12pt, double spacing, 1-inch margins throughout. Follow APA 7th edition for all in-text citations and the reference list. Manuscripts must include: title, abstract (200–300 words), keywords (5–8 terms), introduction, body sections, conclusion, and references. Do not include author names or institutional affiliations anywhere in the manuscript file — all papers undergo double-blind review.",
  },
  {
    id: "file",
    title: "File Format",
    content: "Submit your paper as a PDF or Microsoft Word (.doc/.docx) file. File size must not exceed 20 MB. Figures and tables should be embedded within the document. Image resolution should be at least 300 DPI. Supplementary materials may be submitted as separate files.",
  },
  {
    id: "review",
    title: "Peer Review Process",
    content: "All submissions undergo a double-blind peer review by a minimum of two independent expert reviewers. Review criteria include: originality, methodological rigour, clarity, contribution to the field, and relevance to media studies. Authors will be notified of the decision within 60 days of submission. Possible decisions are: Accept, Minor Revision, Major Revision, or Reject.",
  },
];

const articleTypes = [
  {
    type: "Original Research Article",
    words: "4,000–8,000 words",
    abstract: "200–300 words",
    keywords: "5–8",
    sections: "Introduction, Literature Review, Methodology, Findings/Results, Discussion, Conclusion, References",
    notes: "Must include a clearly described methodology. Empirical and theoretical papers both welcome.",
  },
  {
    type: "Review Article",
    words: "3,000–5,000 words",
    abstract: "150–250 words",
    keywords: "5–8",
    sections: "Introduction, Review Methodology, Thematic Discussion, Conclusions, References",
    notes: "Systematic or scoping reviews of existing literature. Must cover at least 30 sources published within the last 10 years.",
  },
  {
    type: "Conceptual / Theoretical Paper",
    words: "3,000–6,000 words",
    abstract: "150–250 words",
    keywords: "5–8",
    sections: "Introduction, Theoretical Framework, Discussion, Implications, References",
    notes: "Must advance a new framework, model, or theoretical argument. Empirical data not required.",
  },

];

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%)" }} className="py-12 px-4 text-white text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Submission Guidelines</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">
          Media Scholar — Journal of Media Studies and Humanities
        </p>
        <p className="text-blue-300 text-sm mt-2">ISSN: 3048-5029 | Bi-Annual | Open Access | CC-BY 4.0</p>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">

        {/* Quick nav */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Jump to Section</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {["About", "Article Types", "Formatting", "Peer Review", "Revision Policy", "Withdrawal Policy", "Self-Archiving", "Copyright", "Post-Acceptance"].map(s => (
              <a key={s} href={`#${s.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Core sections */}
        {sections.map(s => (
          <div key={s.id} id={s.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
            <h2 className="font-extrabold text-gray-900 text-lg mb-3">{s.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}

        {/* Article Types */}
        <div id="article-types" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-1">Article Types</h2>
          <p className="text-sm text-gray-500 mb-5">Specific formatting requirements by article type. Manuscripts that do not conform to word limits may be returned without review.</p>
          <div className="space-y-5">
            {articleTypes.map(a => (
              <div key={a.type} className="border border-gray-100 rounded-xl p-5 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-sm mb-3">{a.type}</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <span className="font-semibold text-gray-700">Word Count: </span>
                    <span className="text-gray-600">{a.words}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Abstract: </span>
                    <span className="text-gray-600">{a.abstract}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Keywords: </span>
                    <span className="text-gray-600">{a.keywords}</span>
                  </div>
                </div>
                <div className="text-xs mb-2">
                  <span className="font-semibold text-gray-700">Required Sections: </span>
                  <span className="text-gray-600">{a.sections}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-gray-700">Notes: </span>
                  <span className="text-gray-600">{a.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revision Policy */}
        <div id="revision-policy" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-3">Revision Policy</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs flex items-center justify-center">M</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Minor Revision</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Authors must submit the revised manuscript within <strong>21 days</strong> of receiving the decision. Minor revisions involve corrections to language, clarity, referencing style, or minor structural adjustments. Authors must provide a point-by-point response letter addressing each reviewer comment. Failure to submit within 21 days without prior notification will result in the submission being treated as withdrawn.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">M</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Major Revision</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Authors must submit the revised manuscript within <strong>45 days</strong>. Major revisions may involve significant restructuring, additional data collection or analysis, expanded literature review, or fundamental reconceptualisation. Authors must provide a detailed point-by-point response letter. Revised manuscripts may undergo a second round of peer review. If the major revision requirements are not satisfactorily addressed, the paper may be rejected. A one-time extension of 15 days may be requested before the deadline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Policy */}
        <div id="withdrawal-policy" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-3">Withdrawal Policy</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">Authors may withdraw their manuscript at any stage before formal acceptance, subject to the following conditions:</p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span><strong>Before review assignment:</strong> Withdrawal is permitted without conditions. Authors should notify the editorial office at <a href="mailto:editor@mediascholar.in" className="text-indigo-600 hover:underline">editor@mediascholar.in</a> as soon as possible.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span><strong>During peer review:</strong> Withdrawal must be formally requested via email. The editorial office will confirm withdrawal after notifying assigned reviewers. Authors are strongly discouraged from withdrawing at this stage as it places an undue burden on volunteer reviewers.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span><strong>After acceptance:</strong> Withdrawal after a formal acceptance decision is not permitted except in cases of factual error, ethical concern, or extraordinary circumstances. Authors must provide a written explanation to the Editor-in-Chief. If withdrawal is approved, the manuscript record will be retained for editorial integrity purposes.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
              <span><strong>Duplicate submission:</strong> If a manuscript submitted to Media Scholar is found to be simultaneously under consideration at another journal, it will be immediately rejected and the author may be barred from future submissions for a period of two years.</span>
            </li>
          </ul>
        </div>

        {/* Self-Archiving Policy */}
        <div id="self-archiving" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-3">Self-Archiving Policy</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Media Scholar is a fully open-access journal and actively supports author rights to share their work. Under the <strong>CC-BY 4.0 licence</strong>, authors retain copyright and are free to share, reuse, and build upon their published work with attribution.
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 text-sm mb-2">✓ Permitted (Pre-print)</h3>
              <p className="text-sm text-green-700 leading-relaxed">Authors may post the <strong>pre-review (pre-print) version</strong> of their manuscript on personal websites, institutional repositories, and pre-print servers (such as SSRN, PhilPapers, or ResearchGate) at any time — before, during, or after submission.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 text-sm mb-2">✓ Permitted (Post-publication)</h3>
              <p className="text-sm text-green-700 leading-relaxed">After publication, authors may freely share the <strong>final published version</strong> (PDF) on:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-green-700">
                <li>• ResearchGate and Academia.edu</li>
                <li>• Personal or departmental websites</li>
                <li>• Institutional repositories (Shodhganga, university DSpace, etc.)</li>
                <li>• Google Scholar personal profiles</li>
                <li>• Social media and academic networking platforms</li>
              </ul>
              <p className="text-sm text-green-700 mt-2">Attribution to the original publication in <em>Media Scholar</em> with the DOI (where assigned) must be included.</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div id="copyright" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-3">Copyright &amp; Licensing</h2>
          <div className="flex items-start gap-4">
            <div className="shrink-0 bg-indigo-50 rounded-xl p-3 text-2xl">©</div>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                <strong>Authors retain full copyright</strong> of their work. Upon acceptance, authors grant Media Scholar a non-exclusive licence to publish and distribute the article in print and digital formats.
              </p>
              <p>
                All articles are published under the <strong>Creative Commons Attribution 4.0 International (CC-BY 4.0) licence</strong>. This means anyone may freely read, download, copy, distribute, print, search, or link to the full text of the article, provided the original work is properly cited with author name(s), journal name, volume/issue, and DOI (where applicable).
              </p>
              <p>
                Commercial use and derivative works are permitted under CC-BY 4.0, as long as attribution is maintained. Authors who require a different licensing arrangement must contact the editorial office before submission.
              </p>
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer"
                className="inline-block mt-1 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-xs hover:bg-indigo-100 transition-colors">
                View CC-BY 4.0 Licence →
              </a>
            </div>
          </div>
        </div>

        {/* Post-Acceptance */}
        <div id="post-acceptance" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-1">Post-Acceptance Workflow</h2>
          <p className="text-sm text-gray-500 mb-5">What happens after your paper is accepted.</p>
          <div className="relative space-y-0">
            {[
              {
                step: "1",
                title: "Formal Acceptance Letter",
                desc: "The Editor-in-Chief sends an official acceptance email within 5 working days of the final decision. This email confirms the acceptance and outlines next steps.",
                time: "Within 5 days of decision",
              },
              {
                step: "2",
                title: "Copyediting",
                desc: "The editorial team reviews the manuscript for grammatical errors, formatting consistency, and style compliance. Authors may be contacted for minor clarifications. No substantive content changes are made at this stage.",
                time: "1–2 weeks",
              },
              {
                step: "3",
                title: "Author Proof",
                desc: "A formatted proof is sent to the corresponding author for final review. Authors must review carefully for typographical errors, figure quality, and reference accuracy. Only minor corrections are permitted at this stage. The proof must be approved within 5 working days.",
                time: "5 days turnaround",
              },
              {
                step: "4",
                title: "DOI Assignment",
                desc: "Once the proof is approved, a Digital Object Identifier (DOI) via CrossRef is assigned to the article, permanently linking it to its online location at mediascholar.in.",
                time: "1–3 days",
              },
              {
                step: "5",
                title: "Online Publication",
                desc: "The article is published online on mediascholar.in and becomes immediately freely accessible. The publication page includes the abstract, full-text PDF, citation tools (APA, MLA, Chicago), and structured metadata for Google Scholar indexing.",
                time: "Within the next issue cycle",
              },
              {
                step: "6",
                title: "Issue Assignment",
                desc: "Articles are assigned to the next available bi-annual issue (January or July). Authors are notified by email when their article appears in the published issue. The complete issue is also archived on the platform.",
                time: "January or July",
              },
            ].map((item, idx, arr) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0">{item.step}</div>
                  {idx < arr.length - 1 && <div className="w-0.5 bg-indigo-200 flex-1 my-1" />}
                </div>
                <div className={`pb-6 ${idx === arr.length - 1 ? "" : ""}`}>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <strong>Expected timeline from acceptance to online publication:</strong> 2–4 weeks, depending on proof turnaround and issue schedule. Authors with time-sensitive work may contact the editorial office to discuss expedited processing.
          </div>
        </div>

        {/* Publication Fee */}
        <div id="publication-fee" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm scroll-mt-8">
          <h2 className="font-extrabold text-gray-900 text-lg mb-3">Publication Fee</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
            <span className="text-3xl shrink-0">🎓</span>
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>Media Scholar does not charge any article processing fees (APCs), submission fees, or publication charges.</strong> All submitted papers are considered and all accepted papers are published entirely free of charge. The journal is funded through institutional support and is committed to remaining permanently free for both authors and readers.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-extrabold text-gray-900 mb-2">Questions?</h2>
          <p className="text-sm text-gray-600 mb-5">Contact the editorial office for any queries about submission or these guidelines.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="mailto:editor@mediascholar.in"
              className="px-6 py-2.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-sm">
              Email Editorial Office
            </a>
            <Link href="/register"
              className="px-6 py-2.5 border-2 border-indigo-700 text-indigo-700 font-bold rounded-xl hover:bg-indigo-700 hover:text-white transition-colors text-sm">
              Submit Your Research
            </Link>
          </div>
        </div>

      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
