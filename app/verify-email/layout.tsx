import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Media Scholar",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
