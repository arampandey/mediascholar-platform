import Navbar from "@/components/Navbar";

const EDITOR_IN_CHIEF = {
  name: "Prof. (Dr.) A. Ram Pandey",
  role: "Editor-in-Chief",
  affiliation: "Professor & Dean, School of Media and Communication Studies",
  institution: "Galgotias University, Plot No.2, Sector 17-A Yamuna Expressway, Greater Noida, Uttar Pradesh, India",
  email: "aram.pandey@galgotiasuniversity.edu.in",
  profile: "https://www.galgotiasuniversity.edu.in/p/a-ram-pandey",
};

const SUB_EDITOR = {
  name: "Apoorva Shukla",
  role: "Sub-Editor",
  affiliation: "Assistant Professor, Department of Mass Communication",
  institution: "Galgotias University, Greater Noida, Uttar Pradesh, India",
  phone: "+91 9935731781",
  email: "mediascholarjournal@gmail.com",
  profile: null,
};

const MEMBERS = [
  {
    name: "Prof. (Dr.) Jatin Srivastava",
    affiliation: "Associate Professor & Director, Institute for International Journalism, E.W. Scripps School of Journalism",
    institution: "Ohio University, Athens, Ohio, USA",
    email: "srivastj@ohio.edu",
    profile: "https://www.ohio.edu/scripps-college/journalism/about/faculty-and-staff/srivastj",
  },
  {
    name: "Prof. (Dr.) Rajesh Kumar",
    affiliation: "Professor",
    institution: "Doon University, Dehradun, Uttarakhand",
    email: "rkdoon@gmail.com",
    profile: "https://www.doonuniversity.ac.in/index.php/SMCS/faculty_details/10",
  },
  {
    name: "Prof. (Dr.) Raghavendra Mishra",
    affiliation: "Professor",
    institution: "Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh",
    email: "rmishra@igntu.ac.in",
    profile: "https://igntu.irins.org/profile/49883",
  },
  {
    name: "Prof. (Dr.) Amitabh Srivastava",
    affiliation: "Professor & Head",
    institution: "Central University of Rajasthan, Ajmer, Rajasthan",
    email: "amitabh.srivastava@curaj.ac.in",
    profile: "https://www.curaj.ac.in/faculty/amitabh-srivastava",
  },
  {
    name: "Prof. (Dr.) Harish Kumar",
    affiliation: "Professor & Head",
    institution: "St. Xavier's University, Newtown, Kolkata, West Bengal",
    email: "harish.kumar@sxuk.edu.in",
    profile: "https://sxuk.edu.in/file/faculty/Harish_Kumar.pdf",
  },
  {
    name: "Prof. (Dr.) Tasha Singh Parihar",
    affiliation: "Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "tasha.singh@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-tasha-singh",
  },
  {
    name: "Dr. Bhawani Shankar",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "bhawani.shankar@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-bhawani-shankar",
  },
  {
    name: "Dr. Sunil Mishra",
    affiliation: "Associate Professor",
    institution: "VIPS, Affiliated to Guru Gobind Singh Indraprastha University, Pitampura, New Delhi",
    email: "sunil.mishra@vips.edu",
    profile: "https://vsjmc.vips.edu/sunil-kumar-mishra/",
  },
  {
    name: "Dr. Gajendra Pratap Singh",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "gajendra.pratap@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-gajendra-pratap-singh",
  },
  {
    name: "Dr. Kumari Pallavi",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "kumari.pallavi@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-kumari-pallavi",
  },
  {
    name: "Dr. Pramod Kumar Pandey",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "pramod.pandey@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-pramod-kumar-pandey",
  },
];

export default function EditorialBoardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Editorial Board</h1>
        <p className="text-gray-500 mb-8">Media Scholar — Journal of Media Studies and Humanities</p>

        {/* Editor-in-Chief */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <span className="text-xs font-medium uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">Editor-in-Chief</span>
          <h2 className="text-base font-semibold text-gray-900 mt-2 mb-0.5">{EDITOR_IN_CHIEF.name}</h2>
          <p className="text-sm text-gray-600">{EDITOR_IN_CHIEF.affiliation}</p>
          <p className="text-sm text-gray-500 mb-3">{EDITOR_IN_CHIEF.institution}</p>
          <div className="flex gap-5 flex-wrap text-sm">
            <a href={`mailto:${EDITOR_IN_CHIEF.email}`} className="text-gray-400 hover:text-indigo-600 transition-colors text-xs">✉ {EDITOR_IN_CHIEF.email}</a>
            <a href={EDITOR_IN_CHIEF.profile} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors text-xs">🔗 Profile</a>
          </div>
        </div>

        {/* Board Members */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Editorial Board Members</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {MEMBERS.map(m => (
            <div key={m.name} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <p className="font-bold text-gray-900 text-sm leading-snug">{m.name}</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">{m.affiliation}</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">{m.institution}</p>
              <div className="flex gap-4 flex-wrap">
                <a href={`mailto:${m.email}`} className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">✉ {m.email}</a>
                {m.profile && (
                  <a href={m.profile} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors shrink-0">🔗 Profile</a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sub-Editor */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-8">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Sub-Editor</span>
          <h2 className="text-xl font-extrabold text-gray-900 mt-3 mb-1">{SUB_EDITOR.name}</h2>
          <p className="text-orange-700 text-sm">{SUB_EDITOR.affiliation}</p>
          <p className="text-gray-500 text-sm mb-3">{SUB_EDITOR.institution}</p>
          <div className="flex gap-5 flex-wrap text-sm">
            <a href={`mailto:${SUB_EDITOR.email}`} className="text-orange-600 hover:text-orange-800 transition-colors">✉ {SUB_EDITOR.email}</a>
            <a href={`tel:${SUB_EDITOR.phone}`} className="text-orange-600 hover:text-orange-800 transition-colors">📞 {SUB_EDITOR.phone}</a>
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
