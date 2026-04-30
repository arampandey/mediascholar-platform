import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply as Reviewer | Media Scholar",
  robots: { index: false, follow: false },
};

export default function RegisterReviewerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
