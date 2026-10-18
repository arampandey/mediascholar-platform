// Manuscript file URLs must point at our own Cloudinary account. Anything else
// would let the server be pointed at arbitrary hosts when it fetches the file.
export function isSafeFileUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  let u: URL;
  try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== "https:" || u.hostname !== "res.cloudinary.com") return false;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  return !cloud || u.pathname.startsWith(`/${cloud}/`);
}

// For fetching: also allow legacy site-relative paths ("/uploads/...") and the
// journal's own file host (one older paper is stored there).
export function isFetchableFileUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  if (raw.startsWith("/") && !raw.startsWith("//")) return true;
  if (isSafeFileUrl(raw)) return true;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && u.hostname === "files.mediascholar.in";
  } catch { return false; }
}
