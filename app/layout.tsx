import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediaScholar — Journal of Media Scholars",
  description: "A peer-reviewed bilingual journal (Hindi & English) for media studies and communication research. ISSN: 3048-5029",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
