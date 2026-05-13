# SpecCheck Agent

SpecCheck Agent is an AI-generated-code acceptance assistant. It is not a code
generator. It helps teams answer the uncomfortable question after using AI coding
tools: "the page looks finished, but does it actually satisfy the original
requirement?"

This repository is implemented as a TypeScript monorepo. Phase 0-3 focus on the
core runnable loop: login, create project, enter requirement, generate a
structured acceptance plan, approve it, run deterministic Playwright checks, and
view JSON/Markdown reports.

## Architecture

```mermaid
flowchart LR
  U[User] --> W[Next.js Web]
  W --> DB[(PostgreSQL + Prisma)]
  W --> P[AI Plan Generator]
  W --> R[Playwright Runner]
  R --> A[Target Frontend App]
  R --> E[Evidence Files]
  W --> REP[Reports]
```

## Agent Workflow

```mermaid
flowchart TD
  A[create_job] --> B[generate_plan]
  B --> C[review_plan]
  C --> D[wait_for_human_approval]
  D --> E[start_dev_server]
  E --> F[run_browser_checks]
  F --> G[collect_evidence]
  G --> H[generate_report]
  H --> I[finish]
```

## Local Setup

Use `pnpm.cmd` on Windows if PowerShell blocks `pnpm.ps1`.

```powershell
copy .env.example .env
docker compose up -d
pnpm.cmd install
pnpm.cmd db:generate
pnpm.cmd db:push
pnpm.cmd dev
```

Web app: `http://localhost:3000`

## Phase 0-3 Scope

- Monorepo, TypeScript, ESLint, Prettier, Docker Compose.
- Prisma models for users, projects, jobs, plans, results, evidence, reports, logs.
- Local credential auth with hashed passwords.
- Project CRUD.
- AI or deterministic mock acceptance-plan generation with Zod validation.
- Human approval screen.
- Playwright acceptance runner for `element_exists`, `text_exists`, and `interaction`.
- Markdown and JSON reports with screenshot evidence.

## Safety Boundaries

- `startCommand` is validated against an allowlist.
- Dangerous commands such as `rm`, `del`, `format`, `shutdown`, and shell chaining are rejected.
- Browser execution is deterministic; LLMs generate plans but do not freely control the browser.
- API keys stay in environment variables and are not stored in the database.
- Dev server processes use timeouts and are killed after execution.

## Demo App

The demo login app intentionally misses several requirements. Once implemented,
run it through SpecCheck with `examples/requirements/login.md` to produce a
report that passes the basic fields and fails the missing empty-password,
loading-state, or navigation behavior.

## Later Phases

Phase 4-9 will add LangGraph stateful workflow, RAG with pgvector, MCP server,
advanced dashboard screens, Docker images, GitHub Actions, and deployment docs.
