#!/usr/bin/env node
/**
 * Full backup of Media Scholar: code, database and uploaded files.
 *
 *   node scripts/backup.mjs                 everything (needs DATABASE_URL, and CLOUDINARY_* for files)
 *   node scripts/backup.mjs --code-only     only the code (no secrets needed)
 *   node scripts/backup.mjs --include-env   also copy your env file (contains SECRETS: keep the backup private)
 *   node scripts/backup.mjs --out /path     choose where backups go (default: ~/MediaScholar-Backups)
 *
 * Secrets are read from .env.vercel or .env.local (pull with: npx vercel env pull .env.vercel).
 * Nothing is uploaded anywhere: everything stays on this computer.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const optVal = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const repo = process.cwd();
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const outRoot = optVal("--out") || path.join(os.homedir(), "MediaScholar-Backups");
const out = path.join(outRoot, stamp);
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const manifest = { createdAt: new Date().toISOString(), parts: {} };
const log = (...a) => console.log(...a);

// ---- load env (without printing it) ----
for (const f of [".env.vercel", ".env.local", ".env"]) {
  const p = path.join(repo, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v.replace(/\\n/g, "\n");
  }
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// ---- 1. CODE ----
log("1/3 Code …");
try {
  fs.mkdirSync(path.join(out, "code"), { recursive: true });
  execFileSync("git", ["bundle", "create", path.join(out, "code", "mediascholar.bundle"), "--all"], { cwd: repo, stdio: "pipe" });
  execFileSync("git", ["archive", "--format=tar.gz", "-o", path.join(out, "code", "source-snapshot.tar.gz"), "HEAD"], { cwd: repo, stdio: "pipe" });
  // work in progress that is not committed yet
  const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: repo }).toString().trim();
  if (dirty) fs.writeFileSync(path.join(out, "code", "UNCOMMITTED-FILES.txt"), dirty + "\n");
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
  manifest.parts.code = { ok: true, commit: head, uncommittedFiles: dirty ? dirty.split("\n").length : 0 };
  log("   ok (commit " + head.slice(0, 7) + (dirty ? ", note: some files are not committed — see UNCOMMITTED-FILES.txt" : "") + ")");
} catch (e) {
  manifest.parts.code = { ok: false, error: String(e.message || e).slice(0, 300) };
  log("   FAILED:", manifest.parts.code.error);
}

if (flag("--include-env")) {
  for (const f of [".env.vercel", ".env.local", ".env"]) {
    const p = path.join(repo, f);
    if (fs.existsSync(p)) { fs.mkdirSync(path.join(out, "SECRETS"), { recursive: true, mode: 0o700 }); fs.copyFileSync(p, path.join(out, "SECRETS", f)); }
  }
  log("   env file copied into SECRETS/ — keep this backup private");
}

if (!flag("--code-only")) {
  // ---- 2. DATABASE ----
  log("2/3 Database …");
  if (!process.env.DATABASE_URL) {
    manifest.parts.database = { ok: false, error: "DATABASE_URL not found (run: npx vercel env pull .env.vercel)" };
    log("   SKIPPED:", manifest.parts.database.error);
  } else {
    const dbDir = path.join(out, "database");
    fs.mkdirSync(dbDir, { recursive: true });
    let prisma;
    try {
      const { PrismaClient } = await import("@prisma/client");
      prisma = new PrismaClient();
      const tables = (await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`)).map((r) => r.table_name);
      const counts = {};
      for (const t of tables) {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${t.replace(/"/g, '""')}"`);
        fs.writeFileSync(path.join(dbDir, `${t}.json`), JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 1));
        counts[t] = rows.length;
      }
      manifest.parts.database = { ok: true, format: "json per table", tables: counts };
      log("   ok —", tables.length, "tables,", Object.values(counts).reduce((a, b) => a + b, 0), "rows");
    } catch (e) {
      manifest.parts.database = { ok: false, error: String(e.message || e).slice(0, 300) };
      log("   FAILED:", manifest.parts.database.error);
    } finally {
      try { await prisma?.$disconnect(); } catch {}
    }
    // Standard Postgres dump as well, if pg_dump is installed (optional)
    try {
      execFileSync("pg_dump", [process.env.DATABASE_URL, "-Fc", "-f", path.join(dbDir, "database.pgdump")], { stdio: "pipe" });
      manifest.parts.database = { ...manifest.parts.database, pgdump: true };
      log("   pg_dump ok");
    } catch {
      manifest.parts.database = { ...manifest.parts.database, pgdump: false };
      log("   (pg_dump not available or refused — the JSON export above is still complete)");
    }
  }

  // ---- 3. UPLOADED FILES (Cloudinary) ----
  log("3/3 Uploaded papers …");
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim(), key = process.env.CLOUDINARY_API_KEY?.trim(), secret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloud || !key || !secret) {
    manifest.parts.files = { ok: false, error: "CLOUDINARY_* not found" };
    log("   SKIPPED:", manifest.parts.files.error);
  } else {
    const fdir = path.join(out, "files");
    fs.mkdirSync(fdir, { recursive: true });
    const auth = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
    const sign = (params) => createHash("sha1").update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&") + secret).digest("hex");
    const saved = [], failed = [];
    try {
      for (const rtype of ["raw", "image"]) {
        let cursor = "";
        do {
          const url = `https://api.cloudinary.com/v1_1/${cloud}/resources/${rtype}/upload?prefix=${encodeURIComponent("mediascholar/")}&max_results=500${cursor ? `&next_cursor=${cursor}` : ""}`;
          const res = await fetch(url, { headers: { Authorization: auth } });
          if (!res.ok) { failed.push({ list: rtype, status: res.status }); break; }
          const data = await res.json();
          for (const r of data.resources || []) {
            const name = r.public_id.replace(/[^a-zA-Z0-9._-]+/g, "_") + (r.format && !r.public_id.endsWith("." + r.format) ? "." + r.format : "");
            let buf = null;
            try {
              const direct = await fetch(r.secure_url);
              if (direct.ok) buf = Buffer.from(await direct.arrayBuffer());
            } catch {}
            if (!buf) {
              try {
                const ts = String(Math.floor(Date.now() / 1000));
                const p = { public_id: r.public_id, timestamp: ts, type: "upload" };
                const qs = new URLSearchParams({ ...p, api_key: key, signature: sign(p) });
                const signed = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${rtype}/download?${qs}`);
                if (signed.ok) buf = Buffer.from(await signed.arrayBuffer());
              } catch {}
            }
            if (buf) { fs.writeFileSync(path.join(fdir, name), buf); saved.push({ file: name, publicId: r.public_id, bytes: buf.length, sha256: sha256(buf) }); }
            else failed.push({ publicId: r.public_id });
          }
          cursor = data.next_cursor || "";
        } while (cursor);
      }
      manifest.parts.files = { ok: failed.length === 0, saved: saved.length, failed };
      fs.writeFileSync(path.join(out, "files-manifest.json"), JSON.stringify(saved, null, 1));
      log(`   ${saved.length} files saved${failed.length ? `, ${failed.length} could not be downloaded (see manifest.json)` : ""}`);
    } catch (e) {
      manifest.parts.files = { ok: false, error: String(e.message || e).slice(0, 300) };
      log("   FAILED:", manifest.parts.files.error);
    }
  }
}

fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(out, "RESTORE.md"), `# Restoring Media Scholar from this backup

Created: ${manifest.createdAt}

* code/mediascholar.bundle   full git history: \`git clone mediascholar.bundle mediascholar-restored\`
* code/source-snapshot.tar.gz  source files of the latest commit
* database/                  one JSON file per table (and database.pgdump if pg_dump was available:
                             \`pg_restore --no-owner -d "<new database url>" database.pgdump\`)
* files/                     all uploaded manuscripts/PDFs from Cloudinary (files-manifest.json lists checksums)
* SECRETS/                   only if you used --include-env: passwords and keys, keep private

To bring the site back: create a new Vercel project from the code, set the environment variables
(DATABASE_URL, NEXTAUTH_*, CLOUDINARY_*, email settings), restore the database, re-upload files/ to Cloudinary.
`);
log("\nBackup folder:", out);
log(Object.entries(manifest.parts).map(([k, v]) => `  ${k}: ${v.ok ? "OK" : "PROBLEM"}`).join("\n"));
