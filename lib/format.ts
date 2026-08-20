/**
 * Utility functions for formatting journal metadata consistently.
 */

/**
 * Formats an issue number and optional title into a clean label without repeating "Issue".
 * Examples:
 *   (1, "Issue 1 (Jan–May 2026)") -> "Issue 1 (Jan–May 2026)"
 *   (1, "Issue 1 (2024)")         -> "Issue 1 (2024)"
 *   (1, "January-April 2023")     -> "Issue 1 (January-April 2023)"
 *   (1, "Issue 1")                -> "Issue 1"
 *   (1, null)                     -> "Issue 1"
 */
export function formatIssueLabel(issueNumber: number, issueTitle?: string | null): string {
  if (!issueTitle || !issueTitle.trim()) {
    return `Issue ${issueNumber}`;
  }

  const trimmed = issueTitle.trim();

  // If the title already starts with "Issue <number>", e.g. "Issue 1 (Jan–May 2026)" or "Issue 1"
  const startsWithIssue = new RegExp(`^Issue\\s+${issueNumber}(\\b|:|-|—|\\s|$)`, "i");
  if (startsWithIssue.test(trimmed)) {
    // If it's literally just "Issue X" or "Issue X —"
    if (new RegExp(`^Issue\\s+${issueNumber}[\\s:—]*$`, "i").test(trimmed)) {
      return `Issue ${issueNumber}`;
    }
    // Clean up any extra separator between "Issue X" and description
    return trimmed.replace(new RegExp(`^Issue\\s+${issueNumber}[\\s:—–-]*`, "i"), `Issue ${issueNumber} `).trim();
  }

  // If title is parenthesized e.g. "(Jan–May 2026)"
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    return `Issue ${issueNumber} ${trimmed}`;
  }

  // If title is a period name like "January-April 2023" or "Special Issue"
  return `Issue ${issueNumber} (${trimmed})`;
}
