# PfandChip — Claude Kontext
*Stand: 2026-06-07*

## Was ist das?
RFID-Pfandsystem für Holzbierfässer (Münchner Brauerei).
Lokal, Docker-basiert, DSGVO-konform. Kundenprojekt von Barista State.
GitHub-Ziel: `baristastate/pfand-chip` (noch nicht erstellt)

## Repo
`I:\Münchner Kindl\` | Branch: `codex/dashboard-ux-task-cleanup-20260403`

## Stack
```
01_Software/app/web-dashboard/   → Dashboard (React 19 + TS + Vite)
01_Software/app/scanner-app/     → Scanner  (React 19 + TS + Vite)
01_Software/ai-service/          → AI       (Python + FastAPI + Ollama)
01_Software/supabase/            → DB       (3 Migrationen vorhanden)
01_Software/docker-compose.yml   → Stack    (Supabase, Ollama, Windmill, Node-RED, Prometheus, Grafana)
```

## DB-Schema (fertig)
- `barrels` — Fässer (10L/30L/200L, barrel_status enum)
- `customers` — Kunden (GASTRO/RETAIL/PRIVATE)
- `beers` / `batches` — Bier & Chargen
- `rfid_tags` — RFID-Zuordnung
- Pfand-Trigger-Funktionen + RLS-Policies

## Fass-Status
`CREATED → AVAILABLE → FILLED → DELIVERED → AT_CUSTOMER → EMPTY_REPORTED → RETURNED → CLEANING → (repeat)`
`→ MAINTENANCE | DAMAGED | LOST | RETIRED`

## Pfand
| Größe | Pfand |
|---|---|
| 10L | 20 € |
| 30L | 50 € |
| 200L | 500 € |

## Offene Tasks (Reihenfolge)
1. LICENSE + CLA (AGPLv3 + Kommerziell)
2. Monorepo: Turborepo + pnpm
3. Root package.json + pnpm-workspace.yaml + turbo.json
4. `git mv` Code-Migration
5. packages/database/ (Supabase Client + TS-Typen)
6. scripts/sync-obsidian.py
7. Obsidian Plugins: Dataview, Git, Templater
8. Windmill Sync-Flow
9. .github/ CI + CONTRIBUTING + PR-Template
10. GitHub Repo erstellen + push

## Wichtige Entscheidungen
| Thema | Entscheidung |
|---|---|
| Lizenz | Dual: AGPLv3 + Kommerziell |
| Monorepo | Turborepo + pnpm |
| Obsidian-Sync | Windmill → Python → Markdown |
| Kundenname | Nicht öffentlich (heißt PfandChip) |

## Regeln
- Deutsch, minimal Tokens
- Alles hier synchron speichern
- `git mv` statt kopieren (History!)

## Sessions
| Datum | Thema |
|---|---|
| 2026-06-07 | Setup, System-Scan, Fokus auf PfandChip |
