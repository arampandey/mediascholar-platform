import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

const ISSN = "ISSN: 3048-5029";
const JOURNAL = "MediaScholar — Journal of Media Scholars";
const ADDR = "Galgotias University, Greater Noida | mediascholarjournal@gmail.com | +91 9911893074";

function wrap(body: string): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1a2744;padding:20px 24px;border-radius:8px 8px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:18px;">${JOURNAL}</h2>
    <p style="color:#aab;margin:4px 0 0;font-size:12px;">${ISSN}</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    ${body}
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:12px;">${ADDR}</p>
</div>`;
}

async function send(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({ from: `"${JOURNAL}" <${process.env.GMAIL_USER}>`, to, subject, html: wrap(html) });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendSubmissionConfirmation(to: string, authorName: string, title: string) {
  await send(to, `Submission Received: ${title}`, `
    <p>Dear <strong>${authorName}</strong>,</p>
    <p>Thank you for submitting your paper to <em>${JOURNAL}</em>.</p>
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong>Paper Title:</strong> ${title}
    </div>
    <p>Your submission is now under editorial review. We will notify you of any updates.</p>
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendReviewerAssignment(to: string, reviewerName: string, title: string) {
  await send(to, `Review Assignment: ${title}`, `
    <p>Dear <strong>${reviewerName}</strong>,</p>
    <p>You have been assigned to review the following paper:</p>
    <div style="background:#f5f3ff;border-left:4px solid #8b5cf6;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong>${title}</strong>
    </div>
    <p>Please log in to your reviewer dashboard to complete the review.</p>
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendRevisionRequest(to: string, authorName: string, title: string, notes: string) {
  await send(to, `Revision Requested: ${title}`, `
    <p>Dear <strong>${authorName}</strong>,</p>
    <p>The editorial team has reviewed your submission and requests revisions:</p>
    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong>Paper:</strong> ${title}<br><strong>Notes:</strong> ${notes}
    </div>
    <p>Please log in to your dashboard to submit the revised version.</p>
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendReviewSubmitted(editorEmail: string, reviewerName: string, title: string, decision: string) {
  await send(editorEmail, `Review Submitted for: ${title}`, `
    <p>A review has been submitted.</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong>Paper:</strong> ${title}<br>
      <strong>Reviewer:</strong> ${reviewerName}<br>
      <strong>Decision:</strong> ${decision}
    </div>
    <p>Please log in to the editor dashboard to review.</p>`);
}

export async function sendFinalDecision(to: string, authorName: string, title: string, decision: string, notes: string) {
  const isAccept = decision === "ACCEPT";
  const color = isAccept ? "#22c55e" : decision === "REJECT" ? "#ef4444" : "#f97316";
  await send(to, `Editorial Decision: ${title}`, `
    <p>Dear <strong>${authorName}</strong>,</p>
    <p>The editor has made a final decision on your submission:</p>
    <div style="background:#f9fafb;border-left:4px solid ${color};padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong>Paper:</strong> ${title}<br>
      <strong>Decision:</strong> <span style="color:${color};font-weight:bold;">${decision.replace("_", " ")}</span><br>
      ${notes ? `<strong>Notes:</strong> ${notes}` : ""}
    </div>
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendReviewerApplicationAck(to: string, name: string) {
  await send(to, "Reviewer Application Received", `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for applying to join the reviewer panel of <em>${JOURNAL}</em>.</p>
    <p>Your application is under review. You will be notified once a decision is made.</p>
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendReviewerApplicationDecision(to: string, name: string, approved: boolean) {
  const color = approved ? "#22c55e" : "#ef4444";
  const status = approved ? "APPROVED" : "DECLINED";
  await send(to, `Reviewer Application ${status}`, `
    <p>Dear <strong>${name}</strong>,</p>
    <div style="background:#f9fafb;border-left:4px solid ${color};padding:12px 16px;margin:16px 0;border-radius:4px;">
      Your reviewer application has been <strong style="color:${color};">${status}</strong>.
    </div>
    ${approved ? "<p>You can now log in and review assigned papers from your dashboard.</p>" : "<p>Thank you for your interest.</p>"}
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendReviewThankYou(to: string, reviewerName: string, title: string) {
  await send(to, `Thank You for Your Review`, `
    <p>Dear <strong>${reviewerName}</strong>,</p>
    <p>Thank you for completing your review of:</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong>${title}</strong>
    </div>
    <p>Your contribution to academic publishing is greatly appreciated.</p>
    <p>Best regards,<br>Editorial Team</p>`);
}
