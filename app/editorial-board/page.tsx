import Navbar from "@/components/Navbar";

const EDITOR_IN_CHIEF = {
  name: "A. Ram Pandey, Ph.D.",
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
    name: "Jatin Srivastava, Ph.D.",
    affiliation: "Associate Professor & Director, Institute for International Journalism, E.W. Scripps School of Journalism",
    institution: "Ohio University, Athens, Ohio, USA",
    email: "srivastj@ohio.edu",
    profile: "https://www.ohio.edu/scripps-college/journalism/about/faculty-and-staff/srivastj",
  },
  {
    name: "Rajesh Kumar, Ph.D.",
    affiliation: "Professor",
    institution: "Doon University, Dehradun, Uttarakhand",
    email: "rkdoon@gmail.com",
    profile: "https://www.doonuniversity.ac.in/index.php/SMCS/faculty_details/10",
  },
  {
    name: "Raghavendra Mishra, Ph.D.",
    affiliation: "Professor",
    institution: "Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh",
    email: "rmishra@igntu.ac.in",
    profile: "https://igntu.irins.org/profile/49883",
  },
  {
    name: "Amitabh Srivastava, Ph.D.",
    affiliation: "Professor & Head",
    institution: "Central University of Rajasthan, Ajmer, Rajasthan",
    email: "amitabh.srivastava@curaj.ac.in",
    profile: "https://www.curaj.ac.in/faculty/amitabh-srivastava",
  },
  {
    name: "Harish Kumar, Ph.D.",
    affiliation: "Professor & Head",
    institution: "St. Xavier's University, Newtown, Kolkata, West Bengal",
    email: "harish.kumar@sxuk.edu.in",
    profile: "https://sxuk.edu.in/file/faculty/Harish_Kumar.pdf",
  },
  {
    name: "Tasha Singh Parihar, Ph.D.",
    affiliation: "Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "tasha.singh@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-tasha-singh",
  },
  {
    name: "Bhawani Shankar, Ph.D.",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "bhawani.shankar@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-bhawani-shankar",
  },
  {
    name: "Sunil Mishra, Ph.D.",
    affiliation: "Associate Professor",
    institution: "VIPS, Affiliated to Guru Gobind Singh Indraprastha University, Pitampura, New Delhi",
    email: "sunil.mishra@vips.edu",
    profile: "https://vsjmc.vips.edu/sunil-kumar-mishra/",
  },
  {
    name: "Gajendra Pratap Singh, Ph.D.",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "gajendra.pratap@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-gajendra-pratap-singh",
  },
  {
    name: "Kumari Pallavi, Ph.D.",
    affiliation: "Assistant Professor, School of Media and Communication Studies",
    institution: "Galgotias University, Greater Noida, Uttar Pradesh",
    email: "kumari.pallavi@galgotiasuniversity.edu.in",
    profile: "https://www.galgotiasuniversity.edu.in/p/dr-kumari-pallavi",
  },
  {
    name: "Pramod Kumar Pandey, Ph.D.",
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
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <span className="text-xs font-medium uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">Editor-in-Chief</span>
          <p className="text-base font-bold text-gray-900 mt-2 mb-0.5">{EDITOR_IN_CHIEF.name}</p>
          <p className="text-sm text-indigo-600 font-medium">{EDITOR_IN_CHIEF.affiliation}</p>
          <p className="text-sm text-gray-500 mt-0.5 mb-3">{EDITOR_IN_CHIEF.institution}</p>
          <div className="flex gap-4 flex-wrap">
            <a href={`mailto:${EDITOR_IN_CHIEF.email}`} className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">✉ {EDITOR_IN_CHIEF.email}</a>
            <a href={EDITOR_IN_CHIEF.profile} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors">🔗 Profile</a>
          </div>
        </div>

        {/* Sub-Editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <span className="text-xs font-medium uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">Sub-Editor</span>
          <p className="text-base font-bold text-gray-900 mt-2 mb-0.5">{SUB_EDITOR.name}</p>
          <p className="text-sm text-indigo-600 font-medium">{SUB_EDITOR.affiliation}</p>
          <p className="text-sm text-gray-500 mt-0.5 mb-3">{SUB_EDITOR.institution}</p>
          <div className="flex gap-4 flex-wrap">
            <a href={`mailto:${SUB_EDITOR.email}`} className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">✉ {SUB_EDITOR.email}</a>
            <a href={`tel:${SUB_EDITOR.phone}`} className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">{SUB_EDITOR.phone}</a>
          </div>
        </div>

        {/* Board Members */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Editorial Board Members</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {MEMBERS.map(m => (
            <div key={m.name} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <p className="text-base font-bold text-gray-900 leading-snug">{m.name}</p>
              <p className="text-sm text-indigo-600 font-medium mt-1">{m.affiliation}</p>
              <p className="text-sm text-gray-500 mt-0.5 mb-3">{m.institution}</p>
              <div className="flex gap-4 flex-wrap">
                <a href={`mailto:${m.email}`} className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">✉ {m.email}</a>
                {m.profile && (
                  <a href={m.profile} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors shrink-0">🔗 Profile</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
