"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const ROLE_LABELS: Record<string, string> = { AUTHOR: "Author", REVIEWER: "Reviewer", SUB_EDITOR: "Sub-Editor", EDITOR: "Editor" };

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const role = (session?.user as any)?.role;

  return (
    <nav style={{ backgroundColor: "#1a2744" }} className="text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="font-extrabold text-base sm:text-lg leading-tight">MediaScholar</span>
          <span className="text-xs text-blue-200 leading-tight">Journal of Media Scholars</span>
        </Link>
        <button className="sm:hidden text-white p-1" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
        <div className={`${open ? "flex" : "hidden"} sm:flex flex-col sm:flex-row absolute sm:static top-16 left-0 right-0 sm:top-auto bg-[#1a2744] sm:bg-transparent z-50 sm:z-auto gap-0 sm:gap-1 items-start sm:items-center px-4 sm:px-0 pb-4 sm:pb-0 border-t sm:border-0 border-blue-800`}>
          {[["Home", "/"], ["Journal", "/journal"], ["Archive", "/archive"], ["Editorial Board", "/editorial-board"], ["Guidelines", "/guidelines"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="text-sm px-3 py-2 hover:text-blue-300 transition-colors whitespace-nowrap">{label}</Link>
          ))}
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm px-3 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors ml-0 sm:ml-2 mt-1 sm:mt-0">
                {session.user?.name?.split(" ")[0]} ({ROLE_LABELS[role] || role})
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm px-3 py-2 text-blue-300 hover:text-white transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm px-3 py-2 hover:text-blue-300 transition-colors">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors ml-0 sm:ml-2 mt-1 sm:mt-0">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
