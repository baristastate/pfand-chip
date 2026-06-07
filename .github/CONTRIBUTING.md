# Contributing to PfandChip

Danke für dein Interesse! Bitte lies diese Richtlinien bevor du beiträgst.

## Voraussetzungen

- Node.js >= 20
- pnpm >= 9
- Docker (für lokale Supabase-Instanz)

## Setup

```bash
git clone https://github.com/baristastate/pfand-chip.git
cd pfand-chip
pnpm install
cp infrastructure/.env.example infrastructure/.env
# .env anpassen (Supabase Keys)
docker compose -f infrastructure/docker-compose.yml up -d
pnpm dev
```

## CLA

**Wichtig:** Durch das Einreichen eines Pull Requests stimmst du dem [Contributor License Agreement](../CLA.md) zu.
Das ist notwendig damit Barista State das Dual-License-Modell aufrechterhalten kann.

## Workflow

1. Fork erstellen
2. Feature-Branch: `git checkout -b feature/mein-feature`
3. Änderungen committen (conventional commits: `feat:`, `fix:`, `docs:`, etc.)
4. Pull Request gegen `main` öffnen

## Code-Standards

- TypeScript strict mode
- ESLint + Prettier (läuft automatisch via CI)
- Keine direkten Supabase-Calls in UI-Komponenten — immer über `@pfand-chip/database`

## Fragen?

Issue öffnen oder: baristastate@gmail.com
