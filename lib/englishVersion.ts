import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

// English title + abstract for Hindi papers (needed for Scopus/DOAJ indexing).
//
// Stored in its OWN table so the existing "Submission" table is never altered: if this
// table is missing or a query fails, only this feature is affected, never the rest of
// the site. The table is created on first use (CREATE TABLE IF NOT EXISTS).

export type EnglishStatus = "PENDING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED";

export type EnglishVersion = {
  id: string;
  submissionId: string;
  titleEn: string;
  abstractEn: string;
  status: EnglishStatus;
  authorNote: string | null;
  approvedAt: Date | null;
  updatedAt: Date;
};

const COLUMNS = `"id", "submissionId", "titleEn", "abstractEn", "status", "authorNote", "approvedAt", "updatedAt"`;

let ready: Promise<void> | null = null;

export function ensureEnglishTable(): Promise<void> {
  if (!ready) {
    ready = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "EnglishVersion" (
          "id" TEXT PRIMARY KEY,
          "submissionId" TEXT NOT NULL UNIQUE,
          "titleEn" TEXT NOT NULL,
          "abstractEn" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
          "authorNote" TEXT,
          "proposedById" TEXT,
          "approvedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}

export async function getEnglishVersion(submissionId: string): Promise<EnglishVersion | null> {
  await ensureEnglishTable();
  const rows = await prisma.$queryRawUnsafe<EnglishVersion[]>(
    `SELECT ${COLUMNS} FROM "EnglishVersion" WHERE "submissionId" = $1 LIMIT 1`,
    submissionId
  );
  return rows[0] ?? null;
}

// For public pages: never creates anything and never throws.
export async function getApprovedEnglishVersion(
  submissionId: string
): Promise<{ titleEn: string; abstractEn: string } | null> {
  try {
    const rows = await prisma.$queryRawUnsafe<{ titleEn: string; abstractEn: string }[]>(
      `SELECT "titleEn", "abstractEn" FROM "EnglishVersion" WHERE "submissionId" = $1 AND "status" = 'APPROVED' LIMIT 1`,
      submissionId
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Editor proposes (or re-proposes) the English version: goes back to waiting for the author.
export async function saveProposal(submissionId: string, titleEn: string, abstractEn: string, proposedById: string) {
  await ensureEnglishTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "EnglishVersion" ("id", "submissionId", "titleEn", "abstractEn", "status", "proposedById")
     VALUES ($1, $2, $3, $4, 'PENDING_APPROVAL', $5)
     ON CONFLICT ("submissionId") DO UPDATE SET
       "titleEn" = EXCLUDED."titleEn",
       "abstractEn" = EXCLUDED."abstractEn",
       "status" = 'PENDING_APPROVAL',
       "authorNote" = NULL,
       "approvedAt" = NULL,
       "proposedById" = EXCLUDED."proposedById",
       "updatedAt" = CURRENT_TIMESTAMP`,
    randomUUID(),
    submissionId,
    titleEn,
    abstractEn,
    proposedById
  );
}

export async function setAuthorResponse(submissionId: string, approved: boolean, note: string | null) {
  await ensureEnglishTable();
  await prisma.$executeRawUnsafe(
    `UPDATE "EnglishVersion" SET
       "status" = $2,
       "authorNote" = $3,
       "approvedAt" = ${approved ? "CURRENT_TIMESTAMP" : "NULL"},
       "updatedAt" = CURRENT_TIMESTAMP
     WHERE "submissionId" = $1`,
    submissionId,
    approved ? "APPROVED" : "CHANGES_REQUESTED",
    approved ? null : note
  );
}
