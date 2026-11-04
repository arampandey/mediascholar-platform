// Content-Disposition header value that keeps non-English (e.g. Hindi) titles in the downloaded
// file name. Older browsers use the plain ASCII name; modern browsers use filename*.
export function contentDisposition(disposition: string, title: string | null | undefined, fallbackId: string, ext: string): string {
  const ascii = (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const asciiName = ascii || fallbackId;

  const unicode = (title || "")
    .replace(/[\\/:*?"<>|\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  // English-only titles keep the existing file name exactly as before.
  if (!unicode || !/[^\x00-\x7F]/.test(unicode)) return `${disposition}; filename="${asciiName}.${ext}"`;
  return `${disposition}; filename="${asciiName}.${ext}"; filename*=UTF-8''${encodeURIComponent(unicode)}.${ext}`;
}
