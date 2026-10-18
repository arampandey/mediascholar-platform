import { v2 as cloudinary } from "cloudinary";
import { isFetchableFileUrl } from "./fileUrl";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Fetch the raw bytes of a submission's file, handling Cloudinary's free-plan
 * CDN restriction on raw resource delivery via the signed Admin API download
 * endpoint (same approach used by /pdfs/[slug] and /api/download).
 */
export async function fetchFileBuffer(fileUrl: string): Promise<Buffer> {
  if (!isFetchableFileUrl(fileUrl)) throw new Error("Refusing to fetch untrusted file URL");
  let url = fileUrl;
  if (url.startsWith("/")) {
    url = `https://mediascholar.in${url}`;
  }

  if (url.includes("cloudinary.com")) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const publicIdMatch = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    const publicId = publicIdMatch?.[1];
    if (publicId && cloudName && apiKey && apiSecret) {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const paramsToSign: Record<string, string> = { public_id: publicId, timestamp, type: "upload" };
      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
      const qs = new URLSearchParams({ public_id: publicId, type: "upload", timestamp, api_key: apiKey, signature });
      url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${qs}`;
    }
  }

  const res = await fetch(url, { headers: { Accept: "application/pdf, application/octet-stream, */*" } });
  if (!res.ok) throw new Error(`Failed to fetch file (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
