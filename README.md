# PfandChip

> Lokales RFID-Pfandsystem für Holzbierfässer — vollständig offline, DSGVO-konform, Docker-basiert.

Developed by [Barista State](https://github.com/baristastate)

---

## Was ist PfandChip?

PfandChip verwaltet den kompletten Lebenszyklus von Holzbierfässern (10L / 30L / 200L):
RFID-basiertes Tracking, automatische Pfandabrechnung und lückenlose Dokumentation — alles lokal, kein Cloud-Zwang.

```text
CREATED → AVAILABLE → FILLED → DELIVERED → AT_CUSTOMER
       → EMPTY_REPORTED → RETURNED → CLEANING → (repeat)
```

## Module

| Modul                | Beschreibung                           | Stack                      |
| -------------------- | -------------------------------------- | -------------------------- |
| `apps/scanner`       | RFID-Scanner App (Handheld)            | React 19 + Vite + Tailwind |
| `apps/dashboard`     | Web-Dashboard (Übersicht + Abrechnung) | React 19 + Vite + Tailwind |
| `apps/ai-service`    | Lokale KI-Unterstützung                | Python + FastAPI + Ollama  |
| `packages/database`  | Supabase Client + TypeScript-Typen     | TypeScript                 |
| `infrastructure/`    | Docker, Supabase, Windmill, Node-RED   | Docker Compose             |
| `obsidian/`          | Dokumentation + Auto-Sync aus Supabase | Obsidian Vault             |

## Schnellstart

```bash
git clone https://github.com/baristastate/pfand-chip.git
cd pfand-chip
pnpm install
cp infrastructure/.env.example infrastructure/.env
# .env anpassen (Supabase Keys eintragen)
docker compose -f infrastructure/docker-compose.yml up -d
pnpm dev
```

Dienste nach Start:

- **Scanner App:** <http://localhost:5173>
- **Dashboard:** <http://localhost:5174>
- **Supabase Studio:** <http://localhost:54323>
- **Windmill:** <http://localhost:8000>
- **Grafana:** <http://localhost:3000>

## Voraussetzungen

- Docker Desktop / Docker Engine
- Node.js >= 20 + pnpm >= 9
- 16 GB RAM empfohlen (für lokale KI via Ollama)

## Obsidian Sync

Datenänderungen in Supabase werden automatisch als Markdown-Dateien in `obsidian/` gespiegelt:

```bash
python scripts/sync-obsidian.py
```

Oder automatisch via Windmill Trigger bei jeder Datenbankänderung.

## Beitragen

Siehe [CONTRIBUTING.md](.github/CONTRIBUTING.md).
Durch Beitragen stimmst du dem [CLA](CLA.md) zu.

## Lizenz

- **Open Source:** [AGPLv3](LICENSE) — kostenlos für Community und interne Nutzung
- **Kommerziell:** Siehe [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md) — für externe kommerzielle Nutzung

Copyright (C) 2024-2026 Barista State
