# CLAUDE.md — PfandChip Projekt

> Dieses File wird von Claude Code automatisch geladen. Hier steht alles was du für den Kontext brauchst.

---

## Worum geht es?

**PfandChip** ist ein lokales RFID-Pfandsystem für Holzbierfässer (10L / 30L / 200L) für eine Münchner Brauerei.
Läuft vollständig lokal (kein Cloud-Zwang), Docker-basiert, DSGVO-konform.
Gebaut von Barista State als proprietäres Kundenprojekt — der Kundenname taucht im öffentlichen Repo nicht auf.

**GitHub-Repo (neu, noch nicht erstellt):** `baristastate/pfand-chip`

---

## Aktuelle Projekt-Phase: STRUKTURIERUNG

### Was bisher erledigt ist ✅
- Vollständiges docker-compose Setup (8+ Services: Supabase/Postgres, Ollama, Windmill, Node-RED, Prometheus, Grafana)
- Datenbankschema: 12+ Tabellen + RLS-Policies + Pfand-Trigger-Funktionen (3 Supabase-Migrationen)
- Scanner-App Grundgerüst (`01_Software/app/scanner-app/` — React 19 + TypeScript + Vite)
- Dashboard-App Grundgerüst (`01_Software/app/web-dashboard/` — React 19 + TypeScript + Vite)
- Windmill Automatisierungsscripte (`process_movement.py`, `handle_damage.py`)
- Node-RED RFID-Flow (`node-red/flows.json`)
- Obsidian-Vault mit Templates und MASTER_INDEX.md (`02_Dokumentation/`)
- Umfassende technische Dokumentation (`docs/`)

### Was als nächstes zu tun ist (offene Tasks) ⏳

In dieser Reihenfolge umsetzen:

1. **LICENSE + CLA erstellen**
   - `LICENSE` — AGPLv3 Volltext (Copyright: Barista State)
   - `LICENSE-COMMERCIAL.md` — kommerzielle Nutzungsbedingungen + Kontakt
   - `CLA.md` — Contributor License Agreement

2. **Monorepo-Struktur anlegen** (Turborepo + pnpm)
   ```
   I:\Münchner Kindl\
   ├── apps/
   │   ├── scanner/          ← von 01_Software/app/scanner-app/ hierher
   │   ├── dashboard/        ← von 01_Software/app/web-dashboard/ hierher
   │   └── ai-service/       ← von 01_Software/ai-service/ hierher
   ├── packages/
   │   ├── ui/               ← geteilte React-Komponenten (neu)
   │   ├── database/         ← Supabase-Client + TS-Typen extrahieren (neu)
   │   └── config/           ← geteilte ESLint/TS-Configs (neu)
   ├── infrastructure/
   │   ├── supabase/         ← von 01_Software/supabase/
   │   ├── windmill/         ← von 01_Software/windmill/
   │   ├── node-red/         ← von 01_Software/node-red/
   │   ├── monitoring/       ← von 01_Software/monitoring/
   │   └── docker-compose.yml ← von 01_Software/docker-compose.yml
   ├── obsidian/             ← von 02_Dokumentation/ hierher (Obsidian Vault)
   ├── docs/                 ← von 01_Software/docs/
   ├── scripts/
   │   └── sync-obsidian.py  ← NEU (Supabase → Obsidian Markdown)
   ├── .github/
   │   ├── workflows/ci.yml
   │   ├── CONTRIBUTING.md
   │   └── PULL_REQUEST_TEMPLATE.md
   ├── package.json          ← Workspace-Root (NEU)
   ├── pnpm-workspace.yaml   ← (NEU)
   ├── turbo.json            ← (NEU)
   ├── LICENSE
   ├── LICENSE-COMMERCIAL.md
   ├── CLA.md
   └── README.md
   ```

3. **Root package.json + pnpm-workspace.yaml + turbo.json** anlegen

4. **Code migrieren** (git mv, damit History erhalten bleibt):
   - `01_Software/app/scanner-app/` → `apps/scanner/`
   - `01_Software/app/web-dashboard/` → `apps/dashboard/`
   - `01_Software/ai-service/` → `apps/ai-service/`
   - `01_Software/supabase/` → `infrastructure/supabase/`
   - `01_Software/windmill/` → `infrastructure/windmill/`
   - `01_Software/node-red/` → `infrastructure/node-red/`
   - `01_Software/monitoring/` → `infrastructure/monitoring/`
   - `01_Software/docker-compose.yml` → `infrastructure/docker-compose.yml`
   - `01_Software/docs/` → `docs/`
   - `02_Dokumentation/` → `obsidian/`

5. **packages/database/** erstellen:
   - Supabase-Client aus beiden Apps herausziehen
   - TypeScript-Typen generieren (`supabase gen types typescript`)
   - In beiden Apps durch `@pfand-chip/database` ersetzen

6. **scripts/sync-obsidian.py** schreiben:
   - Verbindet mit Supabase via Service Role Key
   - Holt Fässer + Kunden + Pfandkonten
   - Generiert Markdown aus Templates → `obsidian/01_Fassakten/` und `obsidian/02_Kunden/`
   - Git auto-commit

7. **Obsidian Community Plugins** konfigurieren:
   - Dataview (dynamische Queries)
   - Git (Denis Olehov) — auto-pull bei Vault-Öffnung
   - Templater

8. **Windmill Sync-Flow** anlegen (`infrastructure/windmill/flows/sync-obsidian.json`)

9. **.github/** anlegen:
   - CI Workflow (lint + build auf jedem PR)
   - CONTRIBUTING.md
   - PR-Template

10. **Neues GitHub-Repo erstellen:** `baristastate/pfand-chip`
    - `git remote set-url origin https://github.com/baristastate/pfand-chip.git`
    - `git push -u origin main`

---

## Wichtige Entscheidungen (bereits getroffen)

| Thema | Entscheidung | Begründung |
|---|---|---|
| **Produkt-Name** | PfandChip | Kundenname nicht öffentlich |
| **GitHub-Repo** | baristastate/pfand-chip | Unter Barista State Account |
| **Lizenz** | Dual: AGPLv3 + Kommerziell | Community frei, Unternehmen zahlen |
| **CLA** | Ja, erforderlich | Damit Barista State alle Rechte behält |
| **Monorepo-Tool** | Turborepo + pnpm | Task-Caching, Dependency-aware builds |
| **Obsidian-Sync** | Automatisch bei Datenänderung | Windmill Trigger → Python → Markdown |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind | Bereits vorhanden |
| **Datenbank** | Supabase (PostgreSQL lokal) | Bereits vorhanden |

---

## Tech-Stack Übersicht

```
apps/scanner/      React 19 + TypeScript + Vite + Tailwind + Supabase JS
apps/dashboard/    React 19 + TypeScript + Vite + Tailwind + Supabase JS
apps/ai-service/   Python 3.11 + FastAPI + Ollama (llama3.1:8b lokal)
packages/ui/       React Komponenten (Barrel Status Badge, Cards, etc.)
packages/database/ Supabase Client + generierte TypeScript Typen
infrastructure/    Supabase + Windmill + Node-RED + Docker + Monitoring
obsidian/          Obsidian Vault (Dokumentation, auto-sync via Supabase)
scripts/           sync-obsidian.py
```

---

## Git Status

- **Aktuelles Remote:** `https://github.com/baristastate/PROMPTIXD.git` (wird ersetzt)
- **Aktueller Branch:** `codex/dashboard-ux-task-cleanup-20260403`
- **Ziel-Branch nach Migration:** `main` auf `baristastate/pfand-chip`

> **Wichtig:** `git mv` statt normales Verschieben verwenden, damit die Commit-History der Dateien erhalten bleibt!

---

## Fass-Lebenszyklus

```
CREATED → AVAILABLE → FILLED → DELIVERED → AT_CUSTOMER → EMPTY_REPORTED → RETURNED → CLEANING → (repeat)
                                                                                  ↘ MAINTENANCE
                                                                                  ↘ DAMAGED
                                                                                  ↘ LOST / RETIRED
```

## Pfand-Preise (pro Fass)

| Größe | Pfand |
|---|---|
| 10L | 20,00 € |
| 30L | 50,00 € |
| 200L | 500,00 € |

---

## Obsidian Vault Struktur (nach Migration)

```
obsidian/
├── .obsidian/            ← Config (bestehend)
├── 01_Fassakten/         ← auto-generiert aus Supabase (barrels tabelle)
├── 02_Kunden/            ← auto-generiert aus Supabase (customers tabelle)
├── 03_SOPs/              ← manuell (Standard-Betriebsverfahren)
├── 04_Events/            ← manuell
├── 05_Brauerei/          ← manuell
├── Templates/            ← Fassakte.md, Kundenakte.md
└── MASTER_INDEX.md       ← Vollständige RFID-Systemspezifikation
```

---

## Projekt-Kontext

- Zielbranche: Brauerei (Holzbierfässer)
- Hardware: RFID-Lesegeräte (UHF), Zebra-Handhelds, QR-Code Fallback
- Deployment: Lokal auf PC (GPU/CPU), später dedizierter lokaler Server
- Angebunden an: Später ERP/Warenwirtschaft (REST/OData)
- DSGVO: Alle Daten bleiben lokal, verschlüsselte Backups
