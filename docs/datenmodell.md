# Datenmodell

## ER-Diagramm (Auszug)

### Kern-Tabellen
- **customers**: Kundenstammdaten.
- **barrels**: Physische Fässer (10L, 30L, 200L).
- **rfid_tags**: Zuordnung von RFID UIDs zu Fässern.
- **barrel_movements**: Historie aller Fassbewegungen.
- **deposit_accounts**: Pfandguthaben der Kunden.

### Status-Workflow
Fässer durchlaufen folgende Status:
1. `CREATED` (Neu angelegt)
2. `AVAILABLE` (Im Lager, leer & sauber)
3. `FILLED` (Gefüllt mit Charge)
4. `DELIVERED` (Ausgeliefert, Pfand belastet)
5. `AT_CUSTOMER` (Beim Kunden)
6. `RETURNED` (Zurück in der Brauerei, Pfand erstattet)
7. `CLEANING` (In Reinigung)

## Sicherheitsebene (RLS)
Jede Tabelle verfügt über Row Level Security (RLS) Policies, um den Zugriff je nach Benutzerrolle (Lager, Fahrer, Produktion) zu steuern.
