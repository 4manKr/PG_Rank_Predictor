# TAB India NEET PG 2026 Rank Predictor

A mobile-first NEET PG rank predictor based on 2025 score and rank trends. Candidates enter a score out of 720, submit their name and mobile number, and receive an estimated All India Rank and rank range.

## Local development

```bash
pnpm install
pnpm dev
```

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Confirm the framework preset is **Next.js** and leave the build/output settings at their defaults.
3. Add `NEXT_PUBLIC_SHEETS_URL` with your own deployed Google Apps Script web-app URL.
4. Deploy.

The lead form intentionally has no fallback webhook. Name and phone submissions work only after `NEXT_PUBLIC_SHEETS_URL` is configured, preventing candidate details from being sent to an unknown spreadsheet.

The TAB India logo and PG Website button link to [https://www.tabindia.org/pg](https://www.tabindia.org/pg).
