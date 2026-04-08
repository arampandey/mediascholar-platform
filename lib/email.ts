import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

const JOURNAL = "Media Scholar — Journal of Media Studies and Humanities";
const ISSN = "ISSN: 3048-5029";
const ADDR = "Galgotias University, Greater Noida, Uttar Pradesh, India";
const EMAIL = "mediascholarjournal@gmail.com";
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

async function send(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"${JOURNAL}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: wrap(html),
    });
  } catch (e) {
    console.error("Email error:", e);
  }
}

export async function sendSubmissionConfirmation(to: string, authorName: string, title: string) {
  await send(to, `Manuscript Received — ${title}`, `
    <p ${P}>Dear <strong>${authorName}</strong>,</p>
    <p ${P}>Thank you for submitting your manuscript to <em>${JOURNAL}</em>. We confirm receipt of your submission and will notify you as the editorial process progresses.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
      <p style="margin:0;font-size:14px;color:#1a202c;">${title}</p>
    </div>
    <p ${P}>If you have any queries, please write to us at <a href="mailto:${EMAIL}" style="color:#1a2744;">${EMAIL}</a>.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewerAssignment(to: string, reviewerName: string, title: string) {
  await send(to, `Peer Review Assignment — ${title}`, `
    <p ${P}>Dear <strong>${reviewerName}</strong>,</p>
    <p ${P}>We request your expert opinion as a reviewer for the manuscript submitted to <em>${JOURNAL}</em>. Kindly log in to your reviewer account and submit your evaluation at the earliest.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0;font-size:14px;color:#1a202c;">${title}</p>
    </div>
    <p ${P}>Please log in at <a href="${WEBSITE}" style="color:#1a2744;">${WEBSITE}</a> to access the manuscript and submit your review.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewerAssignment2(to: string, reviewerName: string, title: string, deadlineDays: number, isReplacement: boolean = false) {
  const deadlineDate = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const subjectPrefix = isReplacement ? "Review Request (Replacement)" : "Peer Review Assignment";
  await send(to, `${subjectPrefix} — ${title}`, `
    <p ${P}>Dear <strong>${reviewerName}</strong>,</p>
    <p ${P}>${isReplacement
      ? `You have been requested to serve as a replacement reviewer for the following manuscript submitted to <em>${JOURNAL}</em>.`
      : `We request your expert opinion as a reviewer for the following manuscript submitted to <em>${JOURNAL}</em>.`
    }</p>
    <div ${BOX}>
      <p style="margin:0 0 8px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">${title}</p>
      <p style="margin:0;" ${LABEL}><strong>Review Deadline:</strong> ${deadlineDate} (${deadlineDays} days)</p>
    </div>
    <p ${P}>Kindly evaluate the manuscript on the following criteria, each scored on a scale of 0 to 10:</p>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:#4a5568;margin-bottom:16px;">
      <tr style="background:#f1f5f9;"><td style="padding:8px 12px;border:1px solid #e2e8f0;">Clarity of Writing</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">Score: 0–10</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;">Research Methodology</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">Score: 0–10</td></tr>
      <tr style="background:#f1f5f9;"><td style="padding:8px 12px;border:1px solid #e2e8f0;">Relevance to Media Studies</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">Score: 0–10</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;">Originality and Contribution</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">Score: 0–10</td></tr>
    </table>
    <p ${P}>To submit your review, please log in at <a href="${WEBSITE}" style="color:#1a2744;">${WEBSITE}</a> and navigate to your Reviewer Dashboard. Should you be unable to undertake this review, kindly inform us promptly so that an alternate reviewer may be arranged.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendRevisionRequest(to: string, authorName: string, title: string, notes: string) {
  await send(to, `Revision Required — ${title}`, `
    <p ${P}>Dear <strong>${authorName}</strong>,</p>
    <p ${P}>The editorial team has reviewed your manuscript and requests revisions before a final decision can be made.</p>
    <div ${BOX}>
      <p style="margin:0 0 8px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">${title}</p>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Reviewer Comments:</strong></p>
      <p style="margin:0;font-size:14px;color:#1a202c;">${notes}</p>
    </div>
    <p ${P}>Please log in to your author dashboard at <a href="${WEBSITE}" style="color:#1a2744;">${WEBSITE}</a> to submit the revised manuscript.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewSubmitted(editorEmail: string, reviewerName: string, title: string, decision: string) {
  await send(editorEmail, `Review Submitted — ${title}`, `
    <p ${P}>Dear Editor,</p>
    <p ${P}>A peer review has been submitted for the following manuscript.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript:</strong> ${title}</p>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Reviewer:</strong> ${reviewerName}</p>
      <p style="margin:0;" ${LABEL}><strong>Recommendation:</strong> ${decision.replace(/_/g, " ")}</p>
    </div>
    <p ${P}>Please log in to the editor dashboard at <a href="${WEBSITE}/dashboard/editor" style="color:#1a2744;">${WEBSITE}</a> to view the complete review.</p>
    <p ${SIGN}>Regards,<br><strong>Media Scholar Platform</strong></p>`);
}

export async function sendFinalDecision(to: string, authorName: string, title: string, decision: string, notes: string) {
  const decisionText = decision === "ACCEPT" ? "Accepted for Publication" : decision === "REJECT" ? "Rejected" : "Major Revision Required";
  await send(to, `Editorial Decision — ${title}`, `
    <p ${P}>Dear <strong>${authorName}</strong>,</p>
    <p ${P}>The editorial board has reached a decision on your manuscript submitted to <em>${JOURNAL}</em>.</p>
    <div ${BOX}>
      <p style="margin:0 0 8px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">${title}</p>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Decision:</strong> <strong style="color:#1a2744;">${decisionText}</strong></p>
      ${notes ? `<p style="margin:8px 0 0;" ${LABEL}><strong>Editor's Comments:</strong> ${notes}</p>` : ""}
    </div>
    <p ${P}>For any queries, please write to us at <a href="mailto:${EMAIL}" style="color:#1a2744;">${EMAIL}</a>.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Prof. (Dr.) A. Ram Pandey</strong><br>Editor-in-Chief<br>${JOURNAL}</p>`);
}

export async function sendReviewerApplicationAck(to: string, name: string) {
  await send(to, "Application Received — Reviewer Panel", `
    <p ${P}>Dear <strong>${name}</strong>,</p>
    <p ${P}>Thank you for expressing your interest in joining the reviewer panel of <em>${JOURNAL}</em>. We have received your application and it is currently under consideration.</p>
    <p ${P}>You will be notified once a decision has been made. We appreciate your willingness to contribute to academic publishing.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewerApplicationDecision(to: string, name: string, approved: boolean) {
  const status = approved ? "approved" : "not approved at this time";
  await send(to, `Reviewer Application — ${approved ? "Approved" : "Decision"}`, `
    <p ${P}>Dear <strong>${name}</strong>,</p>
    <p ${P}>We thank you for your interest in joining the reviewer panel of <em>${JOURNAL}</em>.</p>
    <p ${P}>We are pleased to inform you that your application has been <strong>${status}</strong>.</p>
    ${approved ? `<p ${P}>You may now log in to <a href="${WEBSITE}" style="color:#1a2744;">${WEBSITE}</a> using your registered credentials to access your reviewer dashboard.</p>` : `<p ${P}>We encourage you to apply again in the future and thank you for your support of academic publishing.</p>`}
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewReminder(to: string, reviewerName: string, title: string, daysLeft: number) {
  await send(to, `Reminder: Review Pending — ${title}`, `
    <p ${P}>Dear <strong>${reviewerName}</strong>,</p>
    <p ${P}>This is a gentle reminder that your peer review for the manuscript listed below is due in <strong>${daysLeft} day${daysLeft > 1 ? "s" : ""}</strong>. We request you to kindly submit your review at the earliest.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 10px;font-size:14px;color:#1a202c;">${title}</p>
      <p style="margin:0;" ${LABEL}><strong>Days Remaining:</strong> ${daysLeft} day${daysLeft > 1 ? "s" : ""}</p>
    </div>
    <p ${P}>Please log in at <a href="${WEBSITE}" style="color:#1a2744;">${WEBSITE}</a> to submit your review. Should you be unable to complete the review, please inform us immediately.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewRetraction(to: string, reviewerName: string, title: string) {
  await send(to, `Review Assignment Withdrawn — ${title}`, `
    <p ${P}>Dear <strong>${reviewerName}</strong>,</p>
    <p ${P}>We regret to inform you that your review assignment for the manuscript listed below has been withdrawn, as the review was not submitted within the stipulated time period.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0;font-size:14px;color:#1a202c;">${title}</p>
    </div>
    <p ${P}>We appreciate your initial willingness to review and hope to have your valuable contribution on future manuscripts. Please do not hesitate to contact us at <a href="mailto:${EMAIL}" style="color:#1a2744;">${EMAIL}</a>.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendReviewThankYou(to: string, reviewerName: string, title: string) {
  await send(to, `Thank You for Your Review — ${title}`, `
    <p ${P}>Dear <strong>${reviewerName}</strong>,</p>
    <p ${P}>We sincerely thank you for completing your peer review for the manuscript submitted to <em>${JOURNAL}</em>.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0;font-size:14px;color:#1a202c;">${title}</p>
    </div>
    <p ${P}>Your expert evaluation is a vital contribution to the quality and integrity of academic publishing. We value your continued support.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendPlagiarismFailed(to: string, authorName: string, title: string, score: number) {
  await send(to, `Manuscript Not Considered — High Similarity Score: ${title}`, `
    <p ${P}>Dear <strong>${authorName}</strong>,</p>
    <p ${P}>Thank you for submitting your manuscript to <em>${JOURNAL}</em>. We have conducted a plagiarism check using Turnitin and regret to inform you that your submission has exceeded the acceptable similarity threshold.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong> ${title}</p>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Similarity Score:</strong> ${score}%</p>
      <p style="margin:0;" ${LABEL}><strong>Acceptable Limit:</strong> Up to 20%</p>
    </div>
    <p ${P}>Your manuscript will not be forwarded for peer review at this stage. You are requested to revise it to reduce similarity, ensure all sources are properly cited, and resubmit once the similarity score is within acceptable limits.</p>
    <p ${P}>For guidance, please write to us at <a href="mailto:${EMAIL}" style="color:#1a2744;">${EMAIL}</a>.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}

export async function sendPlagiarismPassed(editorEmail: string, authorName: string, title: string, score: number) {
  await send(editorEmail, `Plagiarism Check Cleared — Assign Reviewer: ${title}`, `
    <p ${P}>Dear Editor,</p>
    <p ${P}>The following manuscript has cleared the plagiarism check and is ready for reviewer assignment.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong> ${title}</p>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Author:</strong> ${authorName}</p>
      <p style="margin:0;" ${LABEL}><strong>Similarity Score:</strong> ${score}% (within acceptable limit)</p>
    </div>
    <p ${P}>Please log in to the editor dashboard to assign reviewers for this manuscript.</p>
    <p ${P}><a href="${WEBSITE}/dashboard/editor" style="display:inline-block;background:#1a2744;color:#ffffff;padding:10px 22px;border-radius:4px;text-decoration:none;font-size:14px;">Go to Editor Dashboard</a></p>
    <p ${SIGN}>Regards,<br><strong>Media Scholar Platform</strong></p>`);
}

export async function sendBothReviewersAccepted(to: string, authorName: string, title: string) {
  await send(to, `Congratulations — Manuscript Accepted: ${title}`, `
    <p ${P}>Dear <strong>${authorName}</strong>,</p>
    <p ${P}>We are pleased to inform you that your manuscript has been reviewed by two independent peer reviewers and both have recommended it for publication in <em>${JOURNAL}</em>.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 10px;font-size:14px;color:#1a202c;">${title}</p>
      <p style="margin:0;" ${LABEL}><strong>Status:</strong> Accepted for Publication</p>
    </div>
    <p ${P}>You will be notified of the publication details, including volume, issue, and DOI, in due course. Kindly ensure your manuscript is in its final form.</p>
    <p ${P}>We congratulate you on this achievement and thank you for contributing to <em>${JOURNAL}</em>.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Prof. (Dr.) A. Ram Pandey</strong><br>Editor-in-Chief<br>${JOURNAL}</p>`);
}

export async function sendBothReviewersRejected(to: string, authorName: string, title: string, remarks: string) {
  await send(to, `Manuscript Not Accepted — ${title}`, `
    <p ${P}>Dear <strong>${authorName}</strong>,</p>
    <p ${P}>We regret to inform you that your manuscript has been reviewed by two independent peer reviewers and both have recommended against publication at this stage.</p>
    <div ${BOX}>
      <p style="margin:0 0 6px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 10px;font-size:14px;color:#1a202c;">${title}</p>
      <p style="margin:0;" ${LABEL}><strong>Status:</strong> Not Accepted</p>
      ${remarks ? `<p style="margin:8px 0 0;" ${LABEL}><strong>Reviewers' Comments:</strong> ${remarks}</p>` : ''}
    </div>
    <p ${P}>We encourage you to consider the reviewers' feedback and revise the manuscript for submission to another suitable journal. We appreciate the effort you have put into your research.</p>
    <p ${P}>For any queries, please write to us at <a href="mailto:${EMAIL}" style="color:#1a2744;">${EMAIL}</a>.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Prof. (Dr.) A. Ram Pandey</strong><br>Editor-in-Chief<br>${JOURNAL}</p>`);
}

export async function sendConflictingReviews(editorEmail: string, title: string, review1: string, review2: string) {
  await send(editorEmail, `Editorial Decision Required — Conflicting Reviews: ${title}`, `
    <p ${P}>Dear Editor,</p>
    <p ${P}>The following manuscript has received conflicting recommendations from the two peer reviewers. Your editorial decision is required.</p>
    <div ${BOX}>
      <p style="margin:0 0 8px;" ${LABEL}><strong>Manuscript Title:</strong></p>
      <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">${title}</p>
      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
        <tr style="background:#f1f5f9;"><td style="border:1px solid #e2e8f0;padding:8px 12px;"><strong>Reviewer 1</strong></td><td style="border:1px solid #e2e8f0;padding:8px 12px;">${review1.replace(/_/g, ' ')}</td></tr>
        <tr><td style="border:1px solid #e2e8f0;padding:8px 12px;"><strong>Reviewer 2</strong></td><td style="border:1px solid #e2e8f0;padding:8px 12px;">${review2.replace(/_/g, ' ')}</td></tr>
      </table>
    </div>
    <p ${P}>Please log in to the editor dashboard to review both evaluations and make a final decision.</p>
    <p ${P}><a href="${WEBSITE}/dashboard/editor" style="display:inline-block;background:#1a2744;color:#ffffff;padding:10px 22px;border-radius:4px;text-decoration:none;font-size:14px;">Go to Editor Dashboard</a></p>
    <p ${SIGN}>Regards,<br><strong>Media Scholar Platform</strong></p>`);
}

export async function sendPasswordReset(to: string, name: string, resetUrl: string) {
  await send(to, "Password Reset Request — Media Scholar", `
    <p ${P}>Dear <strong>${name}</strong>,</p>
    <p ${P}>We received a request to reset the password for your Media Scholar account. Please click the link below to set a new password. This link will expire in one hour.</p>
    <p style="margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#1a2744;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:bold;">Reset My Password</a>
    </p>
    <p ${P}>If you did not request a password reset, please disregard this email. Your account will remain secure.</p>
    <p ${SIGN}>Yours sincerely,<br><strong>Editorial Team</strong><br>${JOURNAL}</p>`);
}
