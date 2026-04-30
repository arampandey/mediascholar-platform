import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MediaScholar — Journal of Media Studies and Humanities",
    template: "%s | Media Scholar",
  },
  description: "A peer-reviewed bilingual journal (Hindi & English) for media studies and communication research. ISSN: 3048-5029",
  metadataBase: new URL("https://mediascholar.in"),
  alternates: {
    canonical: "https://mediascholar.in",
  },
  openGraph: {
    siteName: "Media Scholar",
    type: "website",
    locale: "en_IN",
    url: "https://mediascholar.in",
    title: "MediaScholar — Journal of Media Studies and Humanities",
    description: "A peer-reviewed bilingual journal (Hindi & English) for media studies and communication research. ISSN: 3048-5029",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "JA-gSqA7h2x3MTGNj1uhvSe7G14wZxqMbEYxrUpAHDg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="JA-gSqA7h2x3MTGNj1uhvSe7G14wZxqMbEYxrUpAHDg" />
      </head>
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
