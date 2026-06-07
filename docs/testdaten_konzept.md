# Testdaten Konzept

## Zielsetzung
Um die Entwicklung und das Testen des Systems ohne Echtdaten zu ermöglichen, wird ein konsistenter Satz an Demo-Daten verwendet.

## Daten-Kategorien

### 1. Fässer (Barrels)
- Präfix: `BAR-`
- Größen: 10, 30, 200 Liters
- Status: Werden über alle Phasen des Workflows abgebildet.

### 2. Kunden (Customers)
- Kategorien: GASTRO, RETAIL, PRIVATE
- Namen: Fiktive Münchner Adressen und Gaststätten (z.B. "Isar-Stüberl", "Sendlinger Bierquelle").

### 3. RFID Tags
- UID Format: 16-stellige HEX-Strings (z.B. `E0040150...`).

### 4. Chargen (Batches)
- Format: `BATCH-YYYYMMDD-NUM` (z.B. `BATCH-20260607-01`).

## Geheimhaltung in GitHub
- Echtdaten dürfen NIEMALS in `seed.sql` oder Migrationen auftauchen.
- Die `.gitignore` schließt lokale Datenbank-Exporte (`docker/data/`) aus.
- Produktive `.env` Dateien werden lokal verwaltet.
