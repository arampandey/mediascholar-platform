import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as any)?.role;

  if (pathname.startsWith("/dashboard")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    // Sub-editor can access submission detail pages under editor route
    const isSubmissionDetail = pathname.startsWith("/dashboard/editor/submission/");
    if ((pathname.startsWith("/dashboard/editor") || pathname.startsWith("/dashboard/admin")) && role !== "EDITOR") {
      if (isSubmissionDetail && role === "SUB_EDITOR") {
        // Allow sub-editor to access submission details
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    if (pathname.startsWith("/dashboard/sub-editor") && !["EDITOR","SUB_EDITOR"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (pathname.startsWith("/dashboard/reviewer") && !["EDITOR","SUB_EDITOR","REVIEWER"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  return NextResponse.next();
});

export const config = { matcher: ["/dashboard/:path*"] };
