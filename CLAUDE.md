# Monte Lab

> Blood Test Analysis Web App for Monte Hair Clinic

## Project

**Client**: Monte Hair Clinic (monteclinic.com)
**Purpose**: Auto-fetch lab PDFs → AI analyze → branded summary → doctor approve + signature
**Transfer**: Portable — separate GH + Supabase, hand over to client

## Tech Stack

- React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- Supabase (Auth + PostgreSQL + Storage + Edge Functions)
- Claude API (Anthropic SDK) for AI analysis
- pdf-parse (extract) + pdf-lib (generate branded PDF)
- Gmail API (service account) for auto-fetch
- Cloudflare Pages

## Branding

| Element | Value |
|---------|-------|
| Primary | #00868A (teal) |
| Accent | #2A8C8C |
| Text | #606060 |
| Gray | #C8CACC |
| Alert | #c0392b |
| Warning | #e67e22 |
| Font | Sarabun / Noto Sans Thai |

## Roles

| Role | Access |
|------|--------|
| Admin | Everything — manage users, upload, view all |
| Doctor | View all reports, approve/reject + signature |
| Staff | View approved reports only |

## Commands

```bash
bun dev          # Start dev server
bun build        # Production build
bun lint         # Lint
```

## Rules

- No self-signup — admin creates accounts
- ห้าม commit .env หรือ credentials
- Supabase migrations ต้องอยู่ใน supabase/migrations/
- PDF branded output ต้องตรงกับ Monte mockup v4
