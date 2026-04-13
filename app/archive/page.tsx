import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getData() {
  try {
    return await prisma.volume.findMany({
      orderBy: { number: "desc" },
      include: { issues: { orderBy: { number: "asc" }, where: { publishedAt: { not: null } }, include: { submissions: { where: { status: "PUBLISHED" }, select: { id:true, title:true, language:true, doi:true, fileUrl:true, publishedAt:true, author: { select: { name:true } } } } } } },
    });
  } catch { return []; }
}

export default async function ArchivePage() {
  const volumes = await getData();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Archive</h1>
        <p className="text-gray-500 mb-8">All published volumes and issues of Media Scholar</p>
        {volumes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-semibold text-gray-500">No published volumes yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {volumes.map(vol => (
              <div key={vol.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div style={{ backgroundColor: "#1a2744" }} className="px-6 py-4 text-white">
                  <h2 className="text-lg font-bold">Volume {vol.number} ({vol.year})</h2>
                </div>
                <div className="p-4 space-y-4">
                  {vol.issues.length === 0 ? <p className="text-sm text-gray-400 italic px-2">No published issues yet.</p> : vol.issues.map(iss => (
                    <div key={iss.id}>
                      <h3 className="font-semibold text-gray-800 mb-2 px-2">{iss.title || `Issue ${iss.number}`}</h3>
                      <div className="space-y-1">
                        {iss.submissions.map(s => (
                          <div key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <Link href={`/paper/${s.id}`} className="text-sm font-medium text-indigo-800 hover:text-indigo-600 hover:underline transition-colors">{s.title}</Link>
                              <p className="text-xs text-gray-400">{s.author?.name}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${s.language==="hi"?"bg-orange-100 text-orange-700":"bg-blue-100 text-blue-700"}`}>{s.language==="hi"?"HI":"EN"}</span>
                              <Link href={`/paper/${s.id}`} className="text-xs text-indigo-700 hover:underline">Read →</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} MediaScholar. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
