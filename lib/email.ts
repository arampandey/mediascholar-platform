import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

const ISSN = "ISSN: 3048-5029";
const JOURNAL = "MediaScholar — Journal of Media Studies and Humanities";
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

export async function sendReviewerAssignment2(to: string, reviewerName: string, title: string, deadlineDays: number, isReplacement: boolean = false) {
  const deadlineDate = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const subject = isReplacement ? `Replacement Review Request: ${title}` : `Peer Review Assignment: ${title}`;
  await send(to, subject, `
    <p>Dear <strong>${reviewerName}</strong>,</p>
    <p>${isReplacement ? 'You have been assigned as a <strong>replacement reviewer</strong> for the following manuscript:' : 'You have been invited to review the following manuscript for <em>Media Scholar — Journal of Media Studies and Humanities</em>:'}</p>
    <div style="background:#f5f3ff;border-left:4px solid #8b5cf6;padding:16px;margin:16px 0;border-radius:4px;">
      <strong>Paper Title:</strong> ${title}<br><br>
      <strong>Review Deadline:</strong> <span style="color:#7c3aed;font-weight:bold;">${deadlineDate} (${deadlineDays} days)</span>
    </div>
    <p><strong>Instructions:</strong></p>
    <ul style="color:#374151;font-size:14px;line-height:1.8;">
      <li>Log in to <a href="https://mediascholar.in">mediascholar.in</a> using your registered email</li>
      <li>Go to your <strong>Reviewer Dashboard</strong></li>
      <li>Download and read the manuscript</li>
      <li>Submit your scores and comments before the deadline</li>
    </ul>
    <p><strong>Review Criteria:</strong> Clarity, Methodology, Relevance, Originality (each scored 0–10)</p>
    <p>Please log in at your earliest convenience. If you are unable to review, kindly inform us immediately so we can arrange an alternate reviewer.</p>
    <p>Best regards,<br>Editorial Team<br><em>Media Scholar — Journal of Media Studies and Humanities</em></p>`);
}

export async function sendReviewReminder(to: string, reviewerName: string, title: string, daysLeft: number) {
  await send(to, `Reminder: Review Due in ${daysLeft} Days — ${title}`, `
    <p>Dear <strong>${reviewerName}</strong>,</p>
    <p>This is a friendly reminder that your review is due in <strong>${daysLeft} days</strong>.</p>
    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;margin:16px 0;border-radius:4px;">
      <strong>Paper:</strong> ${title}<br>
      <strong>Days Remaining:</strong> <span style="color:#ea580c;font-weight:bold;">${daysLeft} days</span>
    </div>
    <p>Please log in to <a href="https://mediascholar.in">mediascholar.in</a> and complete your review at the earliest.</p>
    <p>Best regards,<br>Editorial Team</p>`);
}

export async function sendReviewRetraction(to: string, reviewerName: string, title: string) {
  await send(to, `Review Assignment Withdrawn — ${title}`, `
    <p>Dear <strong>${reviewerName}</strong>,</p>
    <p>We regret to inform you that your review assignment for the following manuscript has been <strong>withdrawn</strong> due to non-submission of the review within the stipulated time.</p>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin:16px 0;border-radius:4px;">
      <strong>Paper:</strong> ${title}
    </div>
    <p>We appreciate your willingness to review and hope you will be available for future assignments.</p>
    <p>Best regards,<br>Editorial Team<br><em>Media Scholar — Journal of Media Studies and Humanities</em></p>`);
}

export async function sendPasswordReset(to: string, name: string, resetUrl: string) {
  await send(to, "Reset Your Password — Media Scholar", `
    <p>Dear <strong>${name}</strong>,</p>
    <p>We received a request to reset your password for your Media Scholar account.</p>
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;margin:16px 0;border-radius:4px;">
      <p style="margin:0 0 12px;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" style="background:#1a2744;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">Reset Password →</a>
    </div>
    <p style="color:#6b7280;font-size:13px;">If you did not request this, please ignore this email. Your password will not change.</p>
    <p>Best regards,<br>Editorial Team<br><em>Media Scholar — Journal of Media Studies and Humanities</em></p>`);
}

export async function sendPlagiarismFailed(to: string, authorName: string, title: string, score: number) {
  await send(to, `Action Required — High Similarity Detected: ${title}`, `
    <p>Dear <strong>${authorName}</strong>,</p>
    <p>Thank you for submitting your manuscript to <em>${JOURNAL}</em>. After conducting a plagiarism check using Turnitin, we regret to inform you that your submission has exceeded the acceptable similarity threshold.</p>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin:16px 0;border-radius:4px;">
      <strong>Paper:</strong> ${title}<br>
      <strong>Similarity Score:</strong> <span style="color:#ef4444;font-weight:bold;font-size:18px;">${score}%</span><br>
      <strong>Acceptable Limit:</strong> 20%<br><br>
      <strong>Status:</strong> <span style="color:#ef4444;font-weight:bold;">Not Considered for Review</span>
    </div>
    <p><strong>What this means:</strong> Your manuscript has not been forwarded for peer review at this stage. You are requested to revise the manuscript to reduce similarity and ensure originality before resubmitting.</p>
    <p><strong>What you should do:</strong></p>
    <ul style="color:#374151;font-size:14px;">
      <li>Review your manuscript carefully for unintentional similarity</li>
      <li>Ensure all borrowed ideas, data, or text are properly cited</li>
      <li>Paraphrase and add your original analysis where needed</li>
      <li>Resubmit after bringing the similarity score below 20%</li>
    </ul>
    <p>If you have any questions, please contact us at <a href="mailto:mediascholarjournal@gmail.com">mediascholarjournal@gmail.com</a>.</p>
    <p>Best regards,<br>Editorial Team<br><em>${JOURNAL}</em></p>`);
}

export async function sendPlagiarismPassed(editorEmail: string, authorName: string, title: string, score: number) {
  await send(editorEmail, `Plagiarism Check Passed — Ready for Review: ${title}`, `
    <p>Dear Editor,</p>
    <p>A submitted manuscript has cleared the plagiarism check and is ready to be assigned for peer review.</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;margin:16px 0;border-radius:4px;">
      <strong>Paper Title:</strong> ${title}<br>
      <strong>Author:</strong> ${authorName}<br>
      <strong>Similarity Score:</strong> <span style="color:#16a34a;font-weight:bold;font-size:18px;">${score}%</span><br>
      <strong>Status:</strong> <span style="color:#16a34a;font-weight:bold;">✅ Cleared — Ready for Reviewer Assignment</span>
    </div>
    <p>Please log in to the editor dashboard to assign a reviewer for this manuscript.</p>
    <p><a href="https://mediascholar.in/dashboard/editor" style="background:#1a2744;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:8px;">Go to Editor Dashboard →</a></p>
    <p>Best regards,<br>MediaScholar Platform</p>`);
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
