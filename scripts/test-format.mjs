import { formatIssueLabel } from "../lib/format.ts";

const testCases = [
  { number: 1, title: 'January-April 2023' },
  { number: 2, title: 'May-August 2023' },
  { number: 3, title: 'October-December 2023' },
  { number: 1, title: 'Issue 1 (2024)' },
  { number: 2, title: 'Issue 2 (2024)' },
  { number: 1, title: 'Issue 1 (2025)' },
  { number: 2, title: 'Issue 2 (Jan 2026)' },
  { number: 1, title: 'Issue 1 (Jan–May 2026)' },
  { number: 2, title: 'Issue 2 (May–Oct 2026)' },
  { number: 1, title: 'Issue 1' },
  { number: 1, title: null },
];

for (const tc of testCases) {
  console.log(`(${tc.number}, ${JSON.stringify(tc.title)}) => "${formatIssueLabel(tc.number, tc.title)}"`);
}
