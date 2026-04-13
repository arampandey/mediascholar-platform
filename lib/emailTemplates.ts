// Default email templates — used as fallback if DB template not found
// Variables use {{variable_name}} syntax

export const DEFAULT_TEMPLATES: {
  key: string;
  label: string;
  subject: string;
  body: string;
  variables: string[];
}[] = [
  {
    key: "submission_confirmation",
    label: "Submission Confirmation (to Author)",
    subject: "Manuscript Received — {{title}}",
    body: `<p {{P}}>Dear <strong>{{authorName}}</strong>,</p>
<p {{P}}>Thank you for submitting your manuscript to <em>{{JOURNAL}}</em>. We confirm receipt of your submission and will notify you as the editorial process progresses.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0;font-size:14px;color:#1a202c;">{{title}}</p>
</div>
<p {{P}}>If you have any queries, please write to us at <a href="mailto:{{EMAIL}}" style="color:#1a2744;">{{EMAIL}}</a>.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["authorName", "title"],
  },
  {
    key: "reviewer_assignment",
    label: "Reviewer Assignment (to Reviewer)",
    subject: "Peer Review Assignment — {{title}}",
    body: `<p {{P}}>Dear <strong>{{reviewerName}}</strong>,</p>
<p {{P}}>We request your expert opinion as a reviewer for the manuscript submitted to <em>{{JOURNAL}}</em>. Kindly log in to your reviewer account and submit your evaluation at the earliest.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0;font-size:14px;color:#1a202c;">{{title}}</p>
  <p style="margin:8px 0 0;font-size:13px;color:#4a5568;"><strong>Review Deadline:</strong> {{deadlineDate}} ({{deadlineDays}} days)</p>
</div>
<p {{P}}>Please log in at <a href="{{WEBSITE}}" style="color:#1a2744;">{{WEBSITE}}</a> to access the manuscript and submit your review.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["reviewerName", "title", "deadlineDate", "deadlineDays"],
  },
  {
    key: "review_reminder",
    label: "Review Reminder (to Reviewer)",
    subject: "Reminder: Review Pending — {{title}}",
    body: `<p {{P}}>Dear <strong>{{reviewerName}}</strong>,</p>
<p {{P}}>This is a gentle reminder that your peer review for the manuscript listed below is due in <strong>{{daysLeft}} day(s)</strong>. We request you to kindly submit your review at the earliest.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0 0 10px;font-size:14px;color:#1a202c;">{{title}}</p>
  <p style="margin:0;font-size:13px;color:#4a5568;"><strong>Days Remaining:</strong> {{daysLeft}} day(s)</p>
</div>
<p {{P}}>Please log in at <a href="{{WEBSITE}}" style="color:#1a2744;">{{WEBSITE}}</a> to submit your review. Should you be unable to complete the review, please inform us immediately.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["reviewerName", "title", "daysLeft"],
  },
  {
    key: "review_retraction",
    label: "Review Assignment Withdrawn (to Reviewer)",
    subject: "Review Assignment Withdrawn — {{title}}",
    body: `<p {{P}}>Dear <strong>{{reviewerName}}</strong>,</p>
<p {{P}}>We regret to inform you that your review assignment for the manuscript listed below has been withdrawn, as the review was not submitted within the stipulated time period.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0;font-size:14px;color:#1a202c;">{{title}}</p>
</div>
<p {{P}}>We appreciate your initial willingness to review and hope to have your valuable contribution on future manuscripts.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["reviewerName", "title"],
  },
  {
    key: "review_thank_you",
    label: "Thank You for Review (to Reviewer)",
    subject: "Thank You for Your Review — {{title}}",
    body: `<p {{P}}>Dear <strong>{{reviewerName}}</strong>,</p>
<p {{P}}>We sincerely thank you for completing your peer review for the manuscript submitted to <em>{{JOURNAL}}</em>.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0;font-size:14px;color:#1a202c;">{{title}}</p>
</div>
<p {{P}}>Your expert evaluation is a vital contribution to the quality and integrity of academic publishing. We value your continued support.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["reviewerName", "title"],
  },
  {
    key: "review_submitted",
    label: "Review Submitted Notification (to Editor)",
    subject: "Review Submitted — {{title}}",
    body: `<p {{P}}>Dear Editor,</p>
<p {{P}}>A peer review has been submitted for the following manuscript.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript:</strong> {{title}}</p>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Reviewer:</strong> {{reviewerName}}</p>
  <p style="margin:0;font-size:13px;color:#4a5568;"><strong>Recommendation:</strong> {{decision}}</p>
</div>
<p {{P}}>Please log in to the editor dashboard to view the complete review.</p>
<p {{SIGN}}>Regards,<br><strong>Media Scholar Platform</strong></p>`,
    variables: ["reviewerName", "title", "decision"],
  },
  {
    key: "plagiarism_failed",
    label: "Plagiarism Check Failed (to Author)",
    subject: "Manuscript Not Considered — High Similarity Score: {{title}}",
    body: `<p {{P}}>Dear <strong>{{authorName}}</strong>,</p>
<p {{P}}>Thank you for submitting your manuscript to <em>{{JOURNAL}}</em>. We have conducted a plagiarism check and regret to inform you that your submission has exceeded the acceptable similarity threshold.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong> {{title}}</p>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Similarity Score:</strong> {{score}}%</p>
  <p style="margin:0;font-size:13px;color:#4a5568;"><strong>Acceptable Limit:</strong> Up to 20%</p>
</div>
<p {{P}}>Your manuscript will not be forwarded for peer review at this stage. Please revise to reduce similarity, ensure all sources are properly cited, and resubmit.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["authorName", "title", "score"],
  },
  {
    key: "plagiarism_passed",
    label: "Plagiarism Check Cleared (to Editor)",
    subject: "Plagiarism Check Cleared — Assign Reviewer: {{title}}",
    body: `<p {{P}}>Dear Editor,</p>
<p {{P}}>The following manuscript has cleared the plagiarism check and is ready for reviewer assignment.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong> {{title}}</p>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Author:</strong> {{authorName}}</p>
  <p style="margin:0;font-size:13px;color:#4a5568;"><strong>Similarity Score:</strong> {{score}}% (within acceptable limit)</p>
</div>
<p {{P}}>Please log in to the editor dashboard to assign reviewers for this manuscript.</p>
<p {{SIGN}}>Regards,<br><strong>Media Scholar Platform</strong></p>`,
    variables: ["title", "authorName", "score"],
  },
  {
    key: "both_reviewers_accepted",
    label: "Both Reviewers Accepted (to Author)",
    subject: "Congratulations — Manuscript Accepted: {{title}}",
    body: `<p {{P}}>Dear <strong>{{authorName}}</strong>,</p>
<p {{P}}>We are pleased to inform you that your manuscript has been reviewed by two independent peer reviewers and both have recommended it for publication in <em>{{JOURNAL}}</em>.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0 0 10px;font-size:14px;color:#1a202c;">{{title}}</p>
  <p style="margin:0;font-size:13px;color:#4a5568;"><strong>Status:</strong> Accepted for Publication</p>
</div>
<p {{P}}>You will be notified of the publication details including volume, issue, and DOI in due course.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Prof. (Dr.) A. Ram Pandey</strong><br>Editor-in-Chief<br>{{JOURNAL}}</p>`,
    variables: ["authorName", "title"],
  },
  {
    key: "both_reviewers_rejected",
    label: "Both Reviewers Rejected (to Author)",
    subject: "Manuscript Not Accepted — {{title}}",
    body: `<p {{P}}>Dear <strong>{{authorName}}</strong>,</p>
<p {{P}}>We regret to inform you that your manuscript has been reviewed by two independent peer reviewers and both have recommended against publication at this stage.</p>
<div {{BOX}}>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0 0 10px;font-size:14px;color:#1a202c;">{{title}}</p>
  <p style="margin:0;font-size:13px;color:#4a5568;"><strong>Status:</strong> Not Accepted</p>
</div>
<p {{P}}>We encourage you to consider the reviewers' feedback and revise the manuscript for submission to another suitable journal.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Prof. (Dr.) A. Ram Pandey</strong><br>Editor-in-Chief<br>{{JOURNAL}}</p>`,
    variables: ["authorName", "title", "remarks"],
  },
  {
    key: "conflicting_reviews",
    label: "Conflicting Reviews — Decision Required (to Editor)",
    subject: "Editorial Decision Required — Conflicting Reviews: {{title}}",
    body: `<p {{P}}>Dear Editor,</p>
<p {{P}}>The following manuscript has received conflicting recommendations from the two peer reviewers. Your editorial decision is required.</p>
<div {{BOX}}>
  <p style="margin:0 0 8px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">{{title}}</p>
  <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
    <tr style="background:#f1f5f9;"><td style="border:1px solid #e2e8f0;padding:8px 12px;"><strong>Reviewer 1</strong></td><td style="border:1px solid #e2e8f0;padding:8px 12px;">{{review1}}</td></tr>
    <tr><td style="border:1px solid #e2e8f0;padding:8px 12px;"><strong>Reviewer 2</strong></td><td style="border:1px solid #e2e8f0;padding:8px 12px;">{{review2}}</td></tr>
  </table>
</div>
<p {{P}}>Please log in to the editor dashboard to review both evaluations and make a final decision.</p>
<p {{SIGN}}>Regards,<br><strong>Media Scholar Platform</strong></p>`,
    variables: ["title", "review1", "review2"],
  },
  {
    key: "final_decision",
    label: "Final Editorial Decision (to Author)",
    subject: "Editorial Decision — {{title}}",
    body: `<p {{P}}>Dear <strong>{{authorName}}</strong>,</p>
<p {{P}}>The editorial board has reached a decision on your manuscript submitted to <em>{{JOURNAL}}</em>.</p>
<div {{BOX}}>
  <p style="margin:0 0 8px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">{{title}}</p>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Decision:</strong> <strong style="color:#1a2744;">{{decisionText}}</strong></p>
</div>
<p {{P}}>For any queries, please write to us at <a href="mailto:{{EMAIL}}" style="color:#1a2744;">{{EMAIL}}</a>.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Prof. (Dr.) A. Ram Pandey</strong><br>Editor-in-Chief<br>{{JOURNAL}}</p>`,
    variables: ["authorName", "title", "decisionText", "notes"],
  },
  {
    key: "revision_request",
    label: "Revision Request (to Author)",
    subject: "Revision Required — {{title}}",
    body: `<p {{P}}>Dear <strong>{{authorName}}</strong>,</p>
<p {{P}}>The editorial team has reviewed your manuscript and requests revisions before a final decision can be made.</p>
<div {{BOX}}>
  <p style="margin:0 0 8px;font-size:13px;color:#4a5568;"><strong>Manuscript Title:</strong></p>
  <p style="margin:0 0 12px;font-size:14px;color:#1a202c;">{{title}}</p>
  <p style="margin:0 0 6px;font-size:13px;color:#4a5568;"><strong>Reviewer Comments:</strong></p>
  <p style="margin:0;font-size:14px;color:#1a202c;">{{notes}}</p>
</div>
<p {{P}}>Please log in to your author dashboard at <a href="{{WEBSITE}}" style="color:#1a2744;">{{WEBSITE}}</a> to submit the revised manuscript.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["authorName", "title", "notes"],
  },
  {
    key: "reviewer_application_ack",
    label: "Reviewer Application Received (to Applicant)",
    subject: "Application Received — Reviewer Panel",
    body: `<p {{P}}>Dear <strong>{{name}}</strong>,</p>
<p {{P}}>Thank you for expressing your interest in joining the reviewer panel of <em>{{JOURNAL}}</em>. We have received your application and it is currently under consideration.</p>
<p {{P}}>You will be notified once a decision has been made. We appreciate your willingness to contribute to academic publishing.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["name"],
  },
  {
    key: "reviewer_application_approved",
    label: "Reviewer Application Approved (to Applicant)",
    subject: "Reviewer Application — Approved",
    body: `<p {{P}}>Dear <strong>{{name}}</strong>,</p>
<p {{P}}>We thank you for your interest in joining the reviewer panel of <em>{{JOURNAL}}</em>.</p>
<p {{P}}>We are pleased to inform you that your application has been <strong>approved</strong>. You may now log in to <a href="{{WEBSITE}}" style="color:#1a2744;">{{WEBSITE}}</a> using your registered credentials to access your reviewer dashboard.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["name"],
  },
  {
    key: "reviewer_application_rejected",
    label: "Reviewer Application Not Approved (to Applicant)",
    subject: "Reviewer Application — Decision",
    body: `<p {{P}}>Dear <strong>{{name}}</strong>,</p>
<p {{P}}>We thank you for your interest in joining the reviewer panel of <em>{{JOURNAL}}</em>.</p>
<p {{P}}>We regret to inform you that your application has not been approved at this time. We encourage you to apply again in the future and thank you for your support of academic publishing.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["name"],
  },
  {
    key: "email_verification",
    label: "Email Verification (to New User)",
    subject: "Please Verify Your Email Address — Media Scholar",
    body: `<p {{P}}>Dear <strong>{{name}}</strong>,</p>
<p {{P}}>Thank you for registering with <em>{{JOURNAL}}</em>. To activate your account, please verify your email address by clicking the button below.</p>
<p style="margin:24px 0;">
  <a href="{{verifyUrl}}" style="display:inline-block;background:#1a2744;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:bold;">Verify Email Address</a>
</p>
<p {{P}}>This link will expire in 24 hours. If you did not register on our platform, please disregard this email.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["name", "verifyUrl"],
  },
  {
    key: "password_reset",
    label: "Password Reset (to User)",
    subject: "Password Reset Request — Media Scholar",
    body: `<p {{P}}>Dear <strong>{{name}}</strong>,</p>
<p {{P}}>We received a request to reset the password for your Media Scholar account. Please click the link below to set a new password. This link will expire in one hour.</p>
<p style="margin:24px 0;">
  <a href="{{resetUrl}}" style="display:inline-block;background:#1a2744;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:bold;">Reset My Password</a>
</p>
<p {{P}}>If you did not request a password reset, please disregard this email.</p>
<p {{SIGN}}>Yours sincerely,<br><strong>Editorial Team</strong><br>{{JOURNAL}}</p>`,
    variables: ["name", "resetUrl"],
  },
];
