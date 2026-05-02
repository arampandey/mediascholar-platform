import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES } from "@/lib/emailTemplates";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

const JOURNAL = "Media Scholar — Journal of Media Studies and Humanities";
const ISSN = "ISSN: 3048-5029";
const ADDR = "Galgotias University, Greater Noida, Uttar Pradesh, India";
const EMAIL = "editor@mediascholar.in";
const PHONE = "+91 9911893074";
const WEBSITE = "https://mediascholar.in";

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <!-- Header -->
      <tr>
        <td style="background:#1a2744;padding:24px 28px;border-radius:6px 6px 0 0;">
          <p style="margin:0;color:#ffffff;font-size:17px;font-weight:bold;">${JOURNAL}</p>
          <p style="margin:6px 0 0;color:#a0aec0;font-size:12px;">${ISSN} &nbsp;|&nbsp; ${WEBSITE}</p>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:32px 28px;border:1px solid #e2e8f0;border-top:none;">
          ${body}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f1f5f9;padding:16px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 6px 6px;">
          <p style="margin:0;font-size:11px;color:#718096;line-height:1.6;">
            ${JOURNAL}<br>
            ${ADDR}<br>
            ${EMAIL} &nbsp;|&nbsp; ${PHONE}
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const P = `style="margin:0 0 14px;font-size:14px;color:#2d3748;line-height:1.7;"`;
const LABEL = `style="font-size:13px;color:#4a5568;"`;
const BOX = `style="border:1px solid #e2e8f0;border-left:3px solid #1a2744;padding:14px 18px;margin:20px 0;border-radius:4px;background:#f8fafc;"`;
const SIGN = `style="margin:24px 0 0;font-size:14px;color:#2d3748;line-height:1.8;"`;

// Fetch template from DB, fallback to default
async function getTemplate(key: string): Promise<{ subject: string; body: string }> {
  try {
    const db = await prisma.emailTemplate.findUnique({ where: { key } });
    if (db) return { subject: db.subject, body: db.body };
  } catch {}
  const def = DEFAULT_TEMPLATES.find((t) => t.key === key);
  if (!def) throw new Error(`Email template not found: ${key}`);
  return { subject: def.subject, body: def.body };
}

// Replace {{variable}} placeholders
function interpolate(str: string, vars: Record<string, string>): string {
  // Replace style placeholders
  str = str.replace(/\{\{P\}\}/g, P).replace(/\{\{BOX\}\}/g, BOX).replace(/\{\{SIGN\}\}/g, SIGN).replace(/\{\{LABEL\}\}/g, LABEL);
  // Replace content variables
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

// sendRaw: html is already fully wrapped
async function sendRaw(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"${JOURNAL}" <${process.env.GMAIL_USER}>`,
      replyTo: `"${JOURNAL}" <editor@mediascholar.in>`,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("Email error:", e);
  }
}

// send: wraps body in standard layout
async function send(to: string, subject: string, html: string) {
  await sendRaw(to, subject, wrap(html));
}

// sendTemplate: fetch from DB/default, interpolate, wrap, send
async function sendTemplate(to: string, key: string, vars: Record<string, string>) {
  const t = await getTemplate(key);
  const allVars = { ...vars, JOURNAL, EMAIL, WEBSITE, PHONE, ADDR };
  const subject = interpolate(t.subject, allVars);
  const body = interpolate(t.body, allVars);
  await sendRaw(to, subject, wrap(body));
}

export async function sendSubmissionConfirmation(to: string, authorName: string, title: string) {
  await sendTemplate(to, "submission_confirmation", { authorName, title });
}

export async function sendNewSubmissionEditor(editorEmail: string, authorName: string, authorEmail: string, title: string) {
  const submittedOn = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  await sendTemplate(editorEmail, "new_submission_editor", { authorName, authorEmail, title, submittedOn });
}

export async function sendReviewerAssignment(to: string, reviewerName: string, title: string) {
  await sendTemplate(to, "reviewer_assignment", { reviewerName, title, deadlineDate: "", deadlineDays: "15" });
}

export async function sendReviewerAssignment2(to: string, reviewerName: string, title: string, deadlineDays: number, isReplacement: boolean = false) {
  const deadlineDate = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  await sendTemplate(to, "reviewer_assignment", { reviewerName, title, deadlineDate, deadlineDays: String(deadlineDays), isReplacement: isReplacement ? "replacement" : "" });
}

export async function sendRevisionRequest(to: string, authorName: string, title: string, notes: string) {
  await sendTemplate(to, "revision_request", { authorName, title, notes });
}

export async function sendReviewSubmitted(editorEmail: string, reviewerName: string, title: string, decision: string) {
  await sendTemplate(editorEmail, "review_submitted", { reviewerName, title, decision: decision.replace(/_/g, " ") });
}

export async function sendFinalDecision(to: string, authorName: string, title: string, decision: string, notes: string) {
  const decisionText = decision === "ACCEPT" ? "Accepted for Publication" : decision === "REJECT" ? "Rejected" : "Major Revision Required";
  await sendTemplate(to, "final_decision", { authorName, title, decisionText, notes: notes || "" });
}

export async function sendReviewerApplicationAck(to: string, name: string) {
  await sendTemplate(to, "reviewer_application_ack", { name });
}

export async function sendReviewerApplicationDecision(to: string, name: string, approved: boolean) {
  await sendTemplate(to, approved ? "reviewer_application_approved" : "reviewer_application_rejected", { name });
}

export async function sendReviewReminder(to: string, reviewerName: string, title: string, daysLeft: number) {
  await sendTemplate(to, "review_reminder", { reviewerName, title, daysLeft: String(daysLeft) });
}

export async function sendReviewRetraction(to: string, reviewerName: string, title: string) {
  await sendTemplate(to, "review_retraction", { reviewerName, title });
}

export async function sendReviewThankYou(to: string, reviewerName: string, title: string) {
  await sendTemplate(to, "review_thank_you", { reviewerName, title });
}

export async function sendPlagiarismFailed(to: string, authorName: string, title: string, score: number) {
  await sendTemplate(to, "plagiarism_failed", { authorName, title, score: String(score) });
}

export async function sendPlagiarismPassed(editorEmail: string, authorName: string, title: string, score: number) {
  await sendTemplate(editorEmail, "plagiarism_passed", { authorName, title, score: String(score) });
}

export async function sendBothReviewersAccepted(to: string, authorName: string, title: string) {
  await sendTemplate(to, "both_reviewers_accepted", { authorName, title });
}

export async function sendBothReviewersRejected(to: string, authorName: string, title: string, remarks: string) {
  await sendTemplate(to, "both_reviewers_rejected", { authorName, title, remarks: remarks || "" });
}

export async function sendConflictingReviews(editorEmail: string, title: string, review1: string, review2: string) {
  await sendTemplate(editorEmail, "conflicting_reviews", { title, review1: review1.replace(/_/g, " "), review2: review2.replace(/_/g, " ") });
}

export async function sendEmailVerification(to: string, name: string, verifyUrl: string) {
  await sendTemplate(to, "email_verification", { name, verifyUrl });
}

export async function sendPasswordReset(to: string, name: string, resetUrl: string) {
  await sendTemplate(to, "password_reset", { name, resetUrl });
}

export async function sendSubEditorReviewAlert(
  to: string,
  subEditorName: string,
  reviewerName: string,
  title: string,
  remarks: string
) {
  const subject = `Paper Flagged for Review — Reviewer Rejected: ${title}`;
  const html = `
    <p ${P}>Dear ${subEditorName},</p>
    <p ${P}>A reviewer has submitted a <strong>Rejection</strong> decision for the following manuscript. The paper has been forwarded to you for further review and final decision.</p>
    <div ${BOX}>
      <p ${LABEL}><strong>Manuscript:</strong> ${title}</p>
      <p ${LABEL}><strong>Reviewer:</strong> ${reviewerName}</p>
      <p ${LABEL}><strong>Decision:</strong> <span style="color:#c53030;font-weight:bold;">Rejected</span></p>
      ${remarks ? `<p ${LABEL}><strong>Remarks:</strong> ${remarks}</p>` : ""}
    </div>
    <p ${P}>Please log in to your dashboard to review the submission and take appropriate action.</p>
    <p ${P}><a href="https://mediascholar.in/dashboard/sub-editor" style="color:#1a2744;font-weight:bold;">Go to Sub-Editor Dashboard →</a></p>
    <p ${SIGN}>Regards,<br/>Media Scholar Platform</p>
  `;
  await send(to, subject, html);
}

export async function sendReviewerDeclined(
  to: string,
  reviewerName: string,
  reviewerEmail: string,
  title: string,
  reason: string
) {
  const subject = `Reviewer Declined Assignment — ${title}`;
  const html = `
    <p ${P}>Dear Editor,</p>
    <p ${P}>A reviewer has <strong>declined their assignment</strong> for the following manuscript:</p>
    <div ${BOX}>
      <p ${LABEL}><strong>Manuscript:</strong> ${title}</p>
      <p ${LABEL}><strong>Reviewer:</strong> ${reviewerName} (${reviewerEmail})</p>
      <p ${LABEL}><strong>Reason given:</strong> ${reason}</p>
    </div>
    <p ${P}>Please log in to the editor dashboard to assign a replacement reviewer for this manuscript.</p>
    <p ${P}><a href="https://mediascholar.in/dashboard/editor" style="color:#1a2744;font-weight:bold;">Go to Editor Dashboard →</a></p>
    <p ${SIGN}>Regards,<br/>Media Scholar Platform</p>
  `;
  await send(to, subject, html);
}
