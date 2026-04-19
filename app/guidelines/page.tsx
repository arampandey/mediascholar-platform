import Navbar from "@/components/Navbar";

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Submission Guidelines</h1>
        <p className="text-gray-500 mb-8">Please read carefully before submitting your research paper.</p>
        <div className="space-y-6">
          {[{ title: "About the Journal", content: "Media Scholar — Journal of Media Studies and Humanities is a bi-annual, open-access, peer-reviewed bilingual journal (Hindi & English) focused on Media Studies, Mass Communication, Journalism, and related disciplines. ISSN: 3048-5029." },
            { title: "Who Can Submit", content: "Research papers, review articles, and book reviews from faculty members, research scholars, and media professionals are welcome. Authors must register on the platform before submitting." },
            { title: "Language", content: "Submissions are accepted in English and Hindi only. The language must be clearly specified at the time of submission." },
            { title: "Paper Length", content: "Research papers should be between 4,000–8,000 words including references. Review articles may be up to 5,000 words. Abstract: 200–300 words. Keywords: 5–8." },
            { title: "Formatting", content: "Use Times New Roman 12pt, double spacing, 1-inch margins. Follow APA 7th edition for citations. Include title, abstract, keywords, introduction, methodology, findings, conclusion, and references." },
            { title: "File Format", content: "Submit your paper as a PDF or Microsoft Word (.doc/.docx) file. Do not include author names or institutional affiliations in the main text (blind review)." },
            { title: "Originality", content: "Submitted work must be original and not under consideration elsewhere. Papers with more than 20% plagiarism (as detected by Turnitin) will be rejected." },
            { title: "Peer Review Process", content: "All submissions undergo a double-blind peer review by two expert reviewers. Review criteria include: originality, methodology, clarity, and relevance to media studies. Authors will be notified of the decision within 60 days." },
            { title: "Publication Fee", content: "Media Scholar does not charge any article processing or submission fees. All accepted articles are published free of charge." },
            { title: "Copyright", content: "Authors retain copyright. By submitting, authors grant Media Scholar the right to publish and distribute the work in both print and digital formats." },
          ].map(s => (
            <div key={s.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </main>
      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
