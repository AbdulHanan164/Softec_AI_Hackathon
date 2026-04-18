# Opportunity Inbox Copilot — SOFTEC 2026

## Quick Start

1. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

2. Double-click `start.bat` — opens both servers automatically.

   OR manually:
   ```bash
   # Terminal 1 — Backend
   uvicorn backend.main:app --reload

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

3. Open http://localhost:5173

## Demo Flow (for pitch)

1. Fill student profile (30 seconds)
2. Click "Load Demo Emails" — loads 10 realistic emails
3. Click "Analyze & Rank Opportunities"
4. Show ranked results: urgency badges, score breakdown, evidence quotes
5. Expand action checklist for #1 opportunity
6. Show "Do This TODAY" consolidated queue
7. Show "Unlock More Opportunities" gap analysis

## Architecture

```
Raw Emails → Stage 1: Preprocess → Stage 2: AI Classify → Stage 3: AI Extract+Evidence
           → Stage 4: Validate (no AI) → Stage 5: Eligibility Check (no AI)
           → Stage 6: Score (no AI) → Stage 7: Action Checklist → Ranked Output
```

AI is only in 2 of 7 stages. Everything else is deterministic and auditable.

## API

- `POST /api/analyze` — main endpoint
- `GET /api/sample-emails` — demo emails
- `GET /docs` — Swagger UI
