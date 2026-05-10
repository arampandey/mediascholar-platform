/**
 * Zenodo archiving utility for Media Scholar
 *
 * Requires ZENODO_TOKEN env var (personal access token with deposit:write scope).
 * If token is absent, every function is a safe no-op.
 *
 * Zenodo deposit flow:
 *   1. Create deposition (metadata)
 *   2. Upload PDF file to bucket
 *   3. Publish deposition
 *   4. Return { recordId, doi, url }
 */

const ZENODO_API = "https://zenodo.org/api";

export interface ZenodoResult {
  recordId: string;
  doi: string;
  url: string;
}

export interface ZenodoSubmission {
  id: string;
  title: string;
  abstract: string | null;
  keywords: string[];
  language: string;
  fileUrl: string | null;
  publishedAt: Date | string | null;
  author: { name: string; institution: string | null } | null;
  issue: { number: number; volume: { number: number; year: number } } | null;
}

export async function depositToZenodo(
  submission: ZenodoSubmission
): Promise<ZenodoResult | null> {
  const token = process.env.ZENODO_TOKEN;
  if (!token) {
    console.log("[zenodo] ZENODO_TOKEN not set — skipping deposit");
    return null;
  }

  try {
    // ── 1. Build metadata ──────────────────────────────────────────────────
    const creatorName = submission.author?.name || "Unknown Author";
    const affiliation = submission.author?.institution ?? undefined;

    const pubDate = submission.publishedAt
      ? new Date(submission.publishedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // Zenodo language codes (ISO 639-2/B)
    const langCode = submission.language === "hi" ? "hin" : "eng";

    const metadata: Record<string, unknown> = {
      title: submission.title,
      upload_type: "publication",
      publication_type: "article",
      description: submission.abstract
        ? submission.abstract
        : `Published in Media Scholar — Journal of Media Studies and Humanities.`,
      creators: [
        { name: creatorName, ...(affiliation ? { affiliation } : {}) },
      ],
      ...(submission.keywords?.length ? { keywords: submission.keywords } : {}),
      language: langCode,
      access_right: "open",
      license: "cc-by",
      publication_date: pubDate,
      journal_title: "Media Scholar — Journal of Media Studies and Humanities",
      journal_issn: "3048-5029",
      ...(submission.issue
        ? {
            journal_volume: String(submission.issue.volume.number),
            journal_issue: String(submission.issue.number),
          }
        : {}),
      notes: `Full text available at: https://mediascholar.in/paper/${submission.id}`,
    };

    // ── 2. Create deposition ──────────────────────────────────────────────
    const createRes = await fetch(`${ZENODO_API}/deposit/depositions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metadata }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("[zenodo] create deposition failed:", err);
      return null;
    }

    const deposition = await createRes.json();
    const depositionId: number = deposition.id;
    const bucketUrl: string | undefined = deposition.links?.bucket;

    if (!depositionId) {
      console.error("[zenodo] no deposition id returned");
      return null;
    }

    // ── 3. Upload PDF ─────────────────────────────────────────────────────
    if (bucketUrl && submission.fileUrl) {
      try {
        const baseUrl = (
          process.env.NEXTAUTH_URL || "https://mediascholar.in"
        ).trim();
        const fileRes = await fetch(
          `${baseUrl}/api/download?id=${submission.id}`
        );

        if (fileRes.ok) {
          const fileBuffer = await fileRes.arrayBuffer();
          const filename = `mediascholar-${submission.id}.pdf`;

          const uploadRes = await fetch(`${bucketUrl}/${filename}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/pdf",
            },
            body: fileBuffer,
          });

          if (!uploadRes.ok) {
            console.error(
              "[zenodo] file upload failed:",
              await uploadRes.text()
            );
            // Clean up draft and bail — Zenodo requires at least one file to publish
            await fetch(`${ZENODO_API}/deposit/depositions/${depositionId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
            return null;
          }
        } else {
          console.error("[zenodo] could not fetch PDF, status:", fileRes.status);
          // Clean up and bail
          await fetch(`${ZENODO_API}/deposit/depositions/${depositionId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
          return null;
        }
      } catch (fileErr) {
        console.error("[zenodo] file fetch error:", fileErr);
        await fetch(`${ZENODO_API}/deposit/depositions/${depositionId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
        return null;
      }
    } else {
      // No file URL — can't publish to Zenodo without a file
      console.error("[zenodo] no file URL on submission, skipping");
      await fetch(`${ZENODO_API}/deposit/depositions/${depositionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      return null;
    }

    // ── 4. Publish ────────────────────────────────────────────────────────
    const publishRes = await fetch(
      `${ZENODO_API}/deposit/depositions/${depositionId}/actions/publish`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!publishRes.ok) {
      console.error("[zenodo] publish failed:", await publishRes.text());
      return null;
    }

    const published = await publishRes.json();

    return {
      recordId: String(published.id),
      doi: published.doi || "",
      url:
        published.links?.record_html ||
        `https://zenodo.org/record/${published.id}`,
    };
  } catch (err) {
    console.error("[zenodo] unexpected error:", err);
    return null;
  }
}
