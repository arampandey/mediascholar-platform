import Navbar from "@/components/Navbar";

const EDITOR_IN_CHIEF = { name: "Prof. (Dr.) A. Ram Pandey", affiliation: "Galgotias University, Greater Noida", role: "Editor-in-Chief" };
const MEMBERS = [
  { name: "Dr. Jitendra Singh Yadav", affiliation: "Vikram University, Ujjain" },
  { name: "Dr. Dheerendra Nath Pandey", affiliation: "CSJM University, Kanpur" },
  { name: "Dr. Pradeep Kumar Singh", affiliation: "RDVV, Jabalpur" },
  { name: "Dr. Bhaskar Ray", affiliation: "Utkal University, Bhubaneswar" },
  { name: "Dr. Samir Kumar Mishra", affiliation: "Pondicherry University" },
  { name: "Dr. Saurabh Srivastava", affiliation: "University of Lucknow" },
  { name: "Dr. Namra Khatun", affiliation: "Barkatullah University, Bhopal" },
  { name: "Dr. Maddali Kameswararao", affiliation: "Andhra University" },
  { name: "Dr. Rajendra Satnaliwale", affiliation: "Pt. Ravishankar Shukla University, Raipur" },
  { name: "Dr. Rohit Thakur", affiliation: "CSJM University, Kanpur" },
];
const SUB_EDITOR = { name: "Dr. Rinku Singh", role: "Sub-Editor" };

export default function EditorialBoardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Editorial Board</h1>
        <p className="text-gray-500 mb-8">MediaScholar — Journal of Media Scholars</p>

        <div style={{ background: "linear-gradient(135deg, #1a2744, #2d4a8a)" }} className="rounded-2xl p-8 text-white mb-8 text-center">
          <div className="text-5xl mb-3">👑</div>
          <h2 className="text-2xl font-extrabold">{EDITOR_IN_CHIEF.name}</h2>
          <p className="text-blue-200 mt-1">{EDITOR_IN_CHIEF.role}</p>
          <p className="text-blue-300 text-sm mt-0.5">{EDITOR_IN_CHIEF.affiliation}</p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Editorial Board Members</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {MEMBERS.map(m => (
            <div key={m.name} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                {m.name.split(" ").filter(w => w.length > 2).slice(-1)[0]?.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.affiliation}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0">SE</div>
          <div>
            <p className="font-bold text-gray-900">{SUB_EDITOR.name}</p>
            <p className="text-sm text-orange-600 font-medium">{SUB_EDITOR.role}</p>
          </div>
        </div>
      </main>
      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} MediaScholar. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
