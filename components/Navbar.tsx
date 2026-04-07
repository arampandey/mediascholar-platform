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
        <div className="flex items-center gap-3">
          <Link href="/" className="font-extrabold text-lg leading-tight">Media Scholar</Link>
          {/* Social Media Icons */}
          <div className="hidden sm:flex items-center gap-3 ml-1">
            {/* Twitter/X */}
            <a href="https://twitter.com/MediaScholarIn" target="_blank" rel="noopener noreferrer"
              className="text-blue-300 hover:text-white transition-colors" title="Follow on X (Twitter)">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/media-scholar-132980378/" target="_blank" rel="noopener noreferrer"
              className="text-blue-300 hover:text-white transition-colors" title="Follow on LinkedIn">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
        <button className="sm:hidden text-white p-1" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
        <div className={`${open ? "flex" : "hidden"} sm:flex flex-col sm:flex-row absolute sm:static top-16 left-0 right-0 sm:top-auto bg-[#1a2744] sm:bg-transparent z-50 sm:z-auto gap-0 sm:gap-1 items-start sm:items-center px-4 sm:px-0 pb-4 sm:pb-0 border-t sm:border-0 border-blue-800`}>
          {[["Home", "/"], ["Journal", "/journal"], ["All Issues", "/archive"], ["Editorial Board", "/editorial-board"], ["Guidelines", "/guidelines"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="text-sm px-3 py-2 hover:text-blue-300 transition-colors whitespace-nowrap">{label}</Link>
          ))}
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm px-3 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors ml-0 sm:ml-2 mt-1 sm:mt-0">
                {ROLE_LABELS[role] === "Editor" ? "Editor Dashboard" : `${session.user?.name?.split(" ")[0]} (${ROLE_LABELS[role] || role})`}
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
