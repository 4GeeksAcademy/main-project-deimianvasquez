# HealthCore Digital — AI Engineering Monorepo

[![4Geeks Academy](https://img.shields.io/badge/4Geeks-Academy-blue)](https://4geeksacademy.com)
[![AI Engineering](https://img.shields.io/badge/track-AI%20Engineering-green)](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)

_Monorepo for HealthCore Digital's cross-functional AI Engineering project._

_Estas instrucciones tambien estan disponibles en [espanol](./README.es.md)._

---

## Purpose

This repository contains the business context, applications, and project documentation for HealthCore Digital. The company briefing in [`CONTEXT.md`](./CONTEXT.md) is the source of truth for business facts and constraints; [`company-choice.md`](./company-choice.md) records the selected onboarding project.

- Read [`AGENTS.md`](./AGENTS.md) before making repository changes.
- Start with the [`memory-bank/`](./memory-bank/README.md) index for persistent project context and current decisions.
- Use [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md) for the current implementation map and commands.
- Follow the applicable rules indexed in [`.agents/`](./.agents/README.md) and the README/AGENTS nearest to the area you change.

---

## How to start

1. Read the business and technical context linked above.
2. Inspect the target folder's README and any more specific `AGENTS.md` before editing.
3. Use the app-specific commands in the technical context; there is no root workspace runner.
4. Keep changes in the folder responsible for that concern and document new components.
5. Complete the validation and delivery checklist in the root `AGENTS.md` before handing off changes.

---

## How to think about this monorepo

The repository organizes work for **one company** across multiple project areas. Top-level folders group related responsibilities; not every folder currently contains a runnable application.

| Layer               | Folders                           | What lives here                                                  |
| ------------------- | --------------------------------- | ---------------------------------------------------------------- |
| **Company context** | `CONTEXT.md`                      | Domain facts, field names, constraints for your assigned company |
| **User-facing**     | `uis/`, `services/`               | Frontends and backends users (or operators) interact with        |
| **Data**            | `data/`                           | Raw files, pipelines, processed datasets, evaluation sets        |
| **AI**              | `agents/`, `skills/`, `mcps/`     | Agents, reusable agent capabilities, MCP tool servers            |
| **Automation**      | `workflows/`                      | n8n flows and cross-system orchestration                         |
| **Reuse**           | `packages/`, `shared/`            | Shared types, SDKs, schemas, templates                           |
| **Operations**      | `infra/`, `scripts/`, `internal/` | Docker, deploy configs, one-off scripts, internal CLIs           |
| **Documentation**   | `docs/`                           | Architecture, decisions, conventions for the whole repo          |

**Rule of thumb:** if it has a UI → `uis/`. If it exposes an API or runs in the background → `services/`. If it moves or transforms data → `data/`. If an AI model does the work → `agents/` (+ `skills/` or `mcps/` as needed).

---

## Current status

- `uis/website/` contains a bilingual static public website.
- `uis/talent-pipline-tracker/` is a Next.js application with its own package scripts.
- The public site's Next.js migration is assigned to `uis/website/`; the internal app belongs in `uis/backoffice/` and APIs in `services/`. See [`memory-bank/frontend-decisions.md`](./memory-bank/frontend-decisions.md). The current site remains static until migration is planned and implemented.
- Shared TypeScript package metadata exists in `packages/shared/`, but no root workspace runner is configured.
- The other top-level folders provide organization and guidance; do not assume a backend, CI pipeline, Docker Compose stack, or agent runtime exists unless documented in that component.
- The current stack, commands, and known limitations are documented in [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md).

---

## Folder guide — what goes where

Read the linked `README.md` inside each folder before you start coding there.

### Root files

| Path                                                       | Purpose                                     | What you do here                               |
| ---------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| [`CONTEXT.md`](./CONTEXT.md)                               | HealthCore business context and constraints | Read before changing domain behavior           |
| [`company-choice.md`](./company-choice.md)                 | Selected project and agent idea             | Use alongside the company briefing             |
| [`AGENTS.md`](./AGENTS.md)                                 | Repository-wide agent workflow              | Required before making changes                 |
| [`.agents/`](./.agents/README.md)                          | Scoped agent rules                          | Read rules relevant to the affected area       |
| [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md) | Current implementation map                  | Source for real stacks and validation commands |

### `uis/` — user interfaces

**Purpose:** All frontend applications — anything a human sees and clicks.

**Put here:**

- Public website (`website/`)
- Internal admin / backoffice (`backoffice/`)
- Customer portals, loyalty apps, Streamlit/Gradio tools, dashboards with a UI

**Examples:** corporate landing page, operations backoffice, loyalty portal, telemetry dashboard UI

→ See [`uis/README.md`](./uis/README.md)

### `services/` — APIs and backend services

This folder is reserved for backend services. No company API implementation or backend framework is currently configured here. Document the chosen stack and run/test commands when a service is added; do not assume FastAPI or a centralized API already exists.

→ See [`services/README.md`](./services/README.md)

### `data/` — datasets, pipelines, and evaluation

**Purpose:** Everything data-related, from raw files to production-ready tables.

| Subfolder                                       | Purpose                      | What you do here                                                          |
| ----------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| [`data/raw/`](./data/raw/README.md)             | Untouched source data        | Store dumps, exports, sample CSVs/JSON — document origin and PII rules    |
| [`data/pipelines/`](./data/pipelines/README.md) | ETL/ELT jobs                 | Write ingestion, cleaning, and transformation scripts                     |
| [`data/process/`](./data/process/README.md)     | Clean / intermediate outputs | Save artifacts produced by pipelines (features, aggregates, clean tables) |
| [`data/eval/`](./data/eval/README.md)           | Quality measurement          | Golden sets, RAG/agent eval datasets, experiment metrics                  |

**Flow:** `raw` → `pipelines` → `process` → consumed by `services/`, `uis/`, or `agents/`. Use `eval` to prove quality.

### `agents/` — AI agents

**Purpose:** Autonomous or semi-autonomous AI assistants for the company.

**Put here:**

- One subfolder per agent (e.g. `support-agent/`, `onboarding-agent/`)
- Agent config, prompts, tools wiring, tests
- Start from [`agents/_template/`](./agents/_template/README.md) when creating a new agent

**Examples:** customer support bot, employee onboarding copilot, training assistant

→ See [`agents/README.md`](./agents/README.md)

### `skills/` — reusable agent capabilities

**Purpose:** Packaged instructions + scripts that agents (or you in Cursor) reuse across the repo.

**Put here:**

- Skills for data analysis, code review, scraping, research, etc.
- Each skill = a folder with `SKILL.md`, optional scripts and resources

**Example included:** `skills/data-analysis/` (pandas cleaning script + metrics reference)

→ See [`skills/README.md`](./skills/README.md)

### `mcps/` — Model Context Protocol servers

**Purpose:** Bridge AI models to your systems — databases, APIs, GitHub, custom tools.

**Put here:**

- One subfolder per MCP server (e.g. `database-mcp/`, `github-mcp/`)
- Tool definitions, resources, and server config

**When to use:** when an agent needs live access to data or actions your codebase alone cannot provide

→ See [`mcps/README.md`](./mcps/README.md)

### `workflows/` — automation and orchestration

**Purpose:** Connect systems without writing full apps — scheduled jobs, webhooks, notifications.

**Put here:**

- n8n workflow exports, Make/Zapier configs, or orchestration docs
- Flows that link `services/`, `data/pipelines/`, and `agents/`

**Examples:** new-order → Slack alert, nightly ETL trigger, lead → CRM sync

→ See [`workflows/README.md`](./workflows/README.md)

### `packages/` — shared libraries

**Purpose:** Versionable code reused by multiple apps, agents, or pipelines.

**Put here:**

- Shared TypeScript types (`packages/shared/` → `@repo/shared-types`)
- UI component libraries, API clients, analytics SDKs

**Rule:** if `uis/` and `services/` both need the same interface → extract it here

→ See [`packages/README.md`](./packages/README.md)

### `shared/` — loose shared assets

**Purpose:** Resources that are not a full package — schemas, templates, static assets, short docs.

**Put here:**

- JSON schemas, email templates, OpenAPI specs, design tokens
- Anything reused but too small or non-code for `packages/`

→ See [`shared/README.md`](./shared/README.md)

### `docs/` — cross-cutting documentation

**Purpose:** Architecture and decisions that span the whole company project.

**Put here:**

- System architecture diagrams, ADRs, security/observability guides
- Conventions not tied to one app or agent

→ See [`docs/README.md`](./docs/README.md)

### `infra/` — infrastructure and deployment

**Purpose:** How the company project runs in Docker, cloud, or CI.

**Put here:**

- Dockerfiles, Terraform, K8s manifests, Nginx configs, CI/CD pipelines

No root Docker Compose configuration is currently present. Add deployment and local orchestration instructions only when those files exist.

→ See [`infra/README.md`](./infra/README.md)

### `scripts/` — helper scripts

**Purpose:** Small, repeatable automation — not full apps.

**Put here:**

- Setup scripts, seed data generators, lint wrappers, one-off migrations
- Document each script: what it does, args, and how to run it

**Difference from `internal/`:** scripts are usually single files; `internal/` tools are structured projects with their own deps and tests.

→ See [`scripts/README.md`](./scripts/README.md)

### `internal/` — internal developer tools

**Purpose:** Robust utilities for the engineering team.

**Put here:**

- CLIs, packaged migration tools, prompt evaluators
- Tools with their own `package.json`, tests, and install steps

→ See [`internal/README.md`](./internal/README.md)

---

## Where should I put this?

Quick decision guide:

```text
Does it have buttons and screens?          → uis/
Does it run on a server / API / queue?     → services/
Is it raw or transformed data?             → data/raw/ or data/process/
Does it move data between systems?         → data/pipelines/
Do you measure AI/pipeline quality?        → data/eval/
Is it an AI assistant with a goal?         → agents/
Is it a reusable AI capability/instruction?→ skills/
Does AI need to call external tools/APIs?  → mcps/
Is it n8n / scheduled automation?          → workflows/
Will 2+ folders import the same code?      → packages/
Is it a schema/template/asset, not a lib?  → shared/
Is it architecture or team-wide docs?      → docs/
Is it local stack orchestration?           → document its actual location when introduced
Is it Docker / deploy / cloud config?      → infra/
Is it a one-off script?                    → scripts/
Is it a CLI tool with its own package?     → internal/
```

---

## Repository structure (tree)

```text
healthcore-digital/
├── README.md / README.es.md   # Repository guide
├── AGENTS.md                 # Shared agent workflow
├── .agents/                  # Scoped agent rules
├── CONTEXT.md                # HealthCore business context
├── company-choice.md         # Selected onboarding project
├── docs/                     # Cross-cutting project documentation
├── uis/
│   ├── website/              # Bilingual static website
│   └── talent-pipline-tracker/ # Next.js application
├── services/                 # Reserved for backend services
├── data/                     # Data-related project area
├── agents/                    # AI agents (+ _template/ starter)
├── skills/                    # Reusable agent skills
├── mcps/                      # MCP servers for tool access
├── workflows/                 # n8n and automation flows
├── packages/                  # Shared libraries (@repo/shared-types, …)
├── shared/                    # Schemas, templates, loose assets
├── docs/                      # Architecture and cross-cutting docs
├── infra/                     # Docker, Terraform, deployment
├── scripts/                   # Helper scripts
└── internal/                  # Internal CLIs and dev tools
```

---

## Links

- [4Geeks Academy — AI Engineering](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)
- [How to start a coding project](https://4geeks.com/lesson/how-to-start-a-project)

---

## Contributors

This repository originated from the 4Geeks Academy AI Engineering Career Program template, built by [@marcogonzalo](https://www.linkedin.com/in/marcogonzalo), [@alesanchezr](https://x.com/alesanchezr), and other contributors. Find out more about the [AI Engineering Course](https://4geeksacademy.com/en/career-programs/ai-engineering).

You can find other templates and resources like this at the [4Geeks Academy GitHub page](https://github.com/4geeksacademy).

_Project-specific context and implementation status in this repository take precedence over generic template guidance._
