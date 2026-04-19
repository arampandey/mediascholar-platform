import Navbar from "@/components/Navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8">Get in touch with the Media Scholar editorial team.</p>
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {[{ icon: "📧", label: "Email", value: "mediascholarjournal@gmail.com", href: "mailto:mediascholarjournal@gmail.com" }, { icon: "📞", label: "Phone", value: "+91 9911893074", href: "tel:+919911893074" }, { icon: "📍", label: "Address", value: "Galgotias University, Greater Noida, Uttar Pradesh, India", href: null }, { icon: "📰", label: "ISSN", value: "3048-5029", href: null }].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-sm font-semibold text-gray-500 mb-1">{c.label}</div>
              {c.href ? <a href={c.href} className="text-indigo-700 font-medium hover:underline">{c.value}</a> : <p className="text-gray-900 font-medium">{c.value}</p>}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Editor-in-Chief</h2>
          <p className="font-semibold text-gray-900">A. Ram Pandey, Ph.D.</p>
          <p className="text-sm text-gray-600">Galgotias University, Greater Noida</p>
          <p className="text-sm text-gray-500 mt-1">For editorial queries: <a href="mailto:mediascholarjournal@gmail.com" className="text-indigo-700 hover:underline">mediascholarjournal@gmail.com</a></p>
        </div>
      </main>
      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
