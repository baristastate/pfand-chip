#!/usr/bin/env python3
"""
sync-obsidian.py — Syncs Supabase data to Obsidian Markdown files.

Triggered by:
  - Windmill flow on postgres_changes event
  - Manual: python scripts/sync-obsidian.py
  - Cron: daily full sync

Flow: Supabase (barrels, customers, deposit_accounts) → Markdown → git commit
"""

import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from supabase import create_client, Client

# ─── Config ───────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
OBSIDIAN_DIR = REPO_ROOT / "obsidian"
BARREL_DIR = OBSIDIAN_DIR / "01_Fassakten"
CUSTOMER_DIR = OBSIDIAN_DIR / "02_Kunden"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://localhost:54321")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

DEPOSIT_PRICES = {"10": 20.00, "30": 50.00, "200": 500.00}

# ─── Supabase ─────────────────────────────────────────────────────────────────

def get_client() -> Client:
    if not SUPABASE_KEY:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY not set")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_all(db: Client) -> tuple[list, list, list]:
    barrels = db.table("barrels").select(
        "*, rfid_tags(tag_epc), customers(name)"
    ).execute().data

    customers = db.table("customers").select(
        "*, deposit_accounts(balance)"
    ).execute().data

    movements = db.table("barrel_movements").select(
        "barrel_id, movement_type, created_at, customers(name)"
    ).order("created_at", desc=True).execute().data

    return barrels, customers, movements

# ─── Markdown Templates ───────────────────────────────────────────────────────

STATUS_EMOJI = {
    "CREATED": "🆕", "AVAILABLE": "✅", "FILLED": "🍺",
    "DELIVERED": "🚚", "AT_CUSTOMER": "📍", "EMPTY_REPORTED": "📭",
    "RETURNED": "↩️", "CLEANING": "🧹", "MAINTENANCE": "🔧",
    "DAMAGED": "⚠️", "LOST": "❌", "RETIRED": "🗃️",
}


def barrel_to_markdown(barrel: dict, movements: list) -> str:
    size = barrel.get("size", "?")
    status = barrel.get("status", "UNKNOWN")
    rfid = barrel.get("rfid_tags", {})
    rfid_epc = rfid.get("tag_epc", "—") if rfid else "—"
    customer = barrel.get("customers", {})
    customer_name = customer.get("name", "—") if customer else "—"
    deposit = DEPOSIT_PRICES.get(str(size), 0)
    emoji = STATUS_EMOJI.get(status, "❓")
    updated = barrel.get("updated_at", "")[:10]

    barrel_movements = [m for m in movements if m["barrel_id"] == barrel["id"]][:5]
    movement_lines = "\n".join(
        f"| {m['created_at'][:16]} | {m['movement_type']} | {(m.get('customers') or {}).get('name', '—')} |"
        for m in barrel_movements
    )

    return f"""---
barrel_id: {barrel['id']}
size: {size}L
status: {status}
rfid: {rfid_epc}
deposit: {deposit:.2f} €
updated: {updated}
tags: [fass, {size}L, {status.lower()}]
---

# Fassakte — {size}L Fass {emoji}

| Feld | Wert |
|---|---|
| **Status** | {emoji} {status} |
| **Größe** | {size} Liter |
| **Pfand** | {deposit:.2f} € |
| **RFID-Tag** | `{rfid_epc}` |
| **QR-Code** | `{barrel.get('qr_code', '—')}` |
| **Aktuell bei** | {customer_name} |
| **Notizen** | {barrel.get('notes', '—')} |
| **Letzte Änderung** | {updated} |

## Letzte Bewegungen

| Zeitpunkt | Ereignis | Kunde |
|---|---|---|
{movement_lines if movement_lines else "| — | Noch keine Bewegungen | — |"}

## Dataview

```dataview
TABLE barrel_id, status, updated
FROM "01_Fassakten"
WHERE size = "{size}"
SORT updated DESC
```
"""


def customer_to_markdown(customer: dict) -> str:
    deposit_account = customer.get("deposit_accounts", [])
    balance = deposit_account[0]["balance"] if deposit_account else 0.0
    balance_emoji = "🟢" if balance >= 0 else "🔴"

    return f"""---
customer_id: {customer['id']}
name: {customer['name']}
deposit_balance: {balance:.2f}
active: {str(customer.get('active', True)).lower()}
tags: [kunde]
---

# Kundenakte — {customer['name']}

| Feld | Wert |
|---|---|
| **Name** | {customer['name']} |
| **Ansprechpartner** | {customer.get('contact_person', '—')} |
| **E-Mail** | {customer.get('email', '—')} |
| **Telefon** | {customer.get('phone', '—')} |
| **Adresse** | {customer.get('address', '—')} |
| **Aktiv** | {'✅ Ja' if customer.get('active', True) else '❌ Nein'} |

## Pfandkonto

| Kontostand | Status |
|---|---|
| **{balance:.2f} €** | {balance_emoji} {'Guthaben' if balance >= 0 else 'Schulden'} |

## Aktuelle Fässer

```dataview
TABLE size, status, updated
FROM "01_Fassakten"
WHERE customer = "{customer['name']}"
SORT updated DESC
```
"""

# ─── File writing ─────────────────────────────────────────────────────────────

def write_markdown(path: Path, content: str) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    if existing == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def slug(text: str) -> str:
    return "".join(c if c.isalnum() or c in "-_" else "-" for c in text).strip("-")

# ─── Git ──────────────────────────────────────────────────────────────────────

def git_commit(changed: list[str]) -> None:
    if not changed:
        return
    try:
        subprocess.run(["git", "add"] + changed, cwd=REPO_ROOT, check=True)
        msg = f"docs: sync obsidian data [{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M')}Z]"
        subprocess.run(["git", "commit", "-m", msg], cwd=REPO_ROOT, check=True)
        print(f"  git commit: {len(changed)} files")
    except subprocess.CalledProcessError as e:
        print(f"  git error: {e}")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"sync-obsidian — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    db = get_client()
    barrels, customers, movements = fetch_all(db)
    print(f"  fetched: {len(barrels)} barrels, {len(customers)} customers")

    changed: list[str] = []

    for barrel in barrels:
        filename = f"BAR-{barrel['size']}-{barrel['id'][:8].upper()}.md"
        path = BARREL_DIR / filename
        content = barrel_to_markdown(barrel, movements)
        if write_markdown(path, content):
            changed.append(str(path.relative_to(REPO_ROOT)))

    for customer in customers:
        filename = f"{slug(customer['name'])}.md"
        path = CUSTOMER_DIR / filename
        content = customer_to_markdown(customer)
        if write_markdown(path, content):
            changed.append(str(path.relative_to(REPO_ROOT)))

    print(f"  updated: {len(changed)} files")
    git_commit(changed)
    print("  done.")


if __name__ == "__main__":
    main()
