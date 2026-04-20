import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aims & Scope | Media Scholar — Journal of Media Studies and Humanities",
  description: "Media Scholar is a peer-reviewed, open-access bilingual journal (Hindi & English) publishing original research in media studies, mass communication, journalism, and humanities. ISSN: 3048-5029.",
  alternates: { canonical: "https://mediascholar.in/aims-and-scope" },
};

export default function AimsAndScopePage() {
  const thematicAreas = [
    { icon: "📡", title: "Mass Communication & Media Studies", desc: "Theories, effects, and practices of mass communication across print, broadcast, and digital media." },
    { icon: "📰", title: "Journalism & News Media", desc: "Investigative journalism, media ethics, press freedom, and evolving newsroom practices." },
    { icon: "📱", title: "Digital Media & New Technologies", desc: "Social media, OTT platforms, AI in media, digital journalism, and online communication." },
    { icon: "🎬", title: "Film & Cinema Studies", desc: "Film theory, documentary studies, regional and national cinema, and media aesthetics." },
    { icon: "🌐", title: "Political Communication", desc: "Election campaigns, political advertising, propaganda, media and democracy." },
    { icon: "🎭", title: "Folk & Cultural Communication", desc: "Traditional media forms, folk arts, tribal communication, and cultural heritage." },
    { icon: "⚖️", title: "Media Law & Policy", desc: "Regulatory frameworks, censorship, intellectual property, and media governance in India." },
    { icon: "🏫", title: "Media Education & Research Methods", desc: "Pedagogy in communication studies, research methodologies, and academic inquiry." },
    { icon: "🤝", title: "Gender, Identity & Representation", desc: "Feminist media studies, LGBTQ+ representation, caste, disability, and minority voices." },
    { icon: "🌱", title: "Development Communication", desc: "Health communication, rural media, e-governance, and communication for social change." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%)" }} className="py-12 px-4 text-white text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Aims &amp; Scope</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">
          Media Scholar — Journal of Media Studies and Humanities
        </p>
        <p className="text-blue-300 text-sm mt-2">ISSN: 3048-5029 | Bi-Annual | Open Access | Peer-Reviewed</p>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-10">

        {/* Mission */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            <strong>Media Scholar — Journal of Media Studies and Humanities</strong> is an open-access, double-blind peer-reviewed bilingual scholarly journal dedicated to advancing knowledge in media studies, mass communication, journalism, and the broader humanities. The journal publishes original research in both <strong>Hindi and English</strong>, reflecting its commitment to India's multilingual intellectual tradition and the global south's scholarly voice.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Founded in January 2023 as a tri-annual publication and transitioning to a bi-annual schedule in 2024, Media Scholar serves as a rigorous platform for faculty, research scholars, independent academics, and media practitioners across India and internationally.
          </p>
        </section>

        {/* Scope */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Scope &amp; Thematic Areas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {thematicAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{area.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{area.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{area.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Types of contributions */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Types of Contributions</h2>
          <div className="space-y-4">
            {[
              { type: "Original Research Articles", desc: "Empirical or theoretical papers presenting new findings, 4,000–8,000 words. Must include abstract, methodology, findings, and references." },
              { type: "Review Articles", desc: "Systematic or scoping reviews of existing literature on a media studies topic, up to 5,000 words." },
              { type: "Conceptual Papers", desc: "Theoretical contributions that advance frameworks or models in media and communication, 3,000–6,000 words." },

            ].map(c => (
              <div key={c.type} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{c.type}: </span>
                  <span className="text-sm text-gray-600">{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Peer review & ethics */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Peer Review &amp; Publication Ethics</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Review Process</h3>
              <p className="leading-relaxed">All submissions undergo rigorous <strong>double-blind peer review</strong> by a minimum of two independent expert reviewers. Review criteria include originality, methodological rigour, clarity, and relevance. Authors are notified within 60 days of submission.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Publication Ethics</h3>
              <p className="leading-relaxed">Media Scholar adheres to COPE (Committee on Publication Ethics) guidelines. Submitted manuscripts must be original, not under simultaneous review elsewhere, and must not exceed 20% similarity as determined by plagiarism screening.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Open Access Policy</h3>
              <p className="leading-relaxed">All published articles are freely available under <strong>Creative Commons CC-BY 4.0</strong> licence. There are no article processing charges (APCs) or submission fees. Authors retain copyright.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Language Policy</h3>
              <p className="leading-relaxed">Media Scholar accepts manuscripts in <strong>English and Hindi</strong>. Authors must clearly specify the submission language. Mixed-language manuscripts are not accepted. Abstracts in both languages are encouraged but not mandatory.</p>
            </div>
          </div>
        </section>

        {/* Key facts */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Journal at a Glance</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: "ISSN", value: "3048-5029" },
              { label: "Frequency", value: "Bi-Annual" },
              { label: "Founded", value: "2023" },
              { label: "Access", value: "Open Access" },
              { label: "Review", value: "Double-Blind" },
              { label: "Languages", value: "Hindi & English" },
              { label: "Licence", value: "CC-BY 4.0" },
              { label: "Publication Fee", value: "None" },
            ].map(f => (
              <div key={f.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-sm font-bold text-indigo-700 mb-1">{f.value}</div>
                <div className="text-xs text-gray-500">{f.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-extrabold text-gray-900 mb-2">Ready to Submit?</h2>
          <p className="text-sm text-gray-600 mb-5">Media Scholar welcomes original research from scholars, faculty, and practitioners across India and globally.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register" className="px-6 py-2.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-sm">Submit Your Research</Link>
            <Link href="/guidelines" className="px-6 py-2.5 border-2 border-indigo-700 text-indigo-700 font-bold rounded-xl hover:bg-indigo-700 hover:text-white transition-colors text-sm">Submission Guidelines</Link>
          </div>
        </section>

      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
