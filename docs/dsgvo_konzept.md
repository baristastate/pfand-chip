# DSGVO Konzept

## Grundsätze
Das Münchner Kindl System verfolgt den Ansatz "Privacy by Design" und "Privacy by Default" für den Brauereibetrieb.

## Maßnahmen
1. **Lokale Datenspeicherung**: Keine personenbezogenen Daten verlassen das Brauereigelände (Self-Hosted Cloud).
2. **Datenminimierung**: Es werden nur die für den Pfandbetrieb notwendigen Daten erhoben.
3. **Zugriffskontrolle**: Striktes Rollenmodell (RBAC) über Supabase Auth und RLS.
4. **Audit Logging**: Alle Änderungen an sensiblen Daten werden in `audit_logs` protokolliert.
5. **Verschlüsselung**: Datenbank-Backups werden verschlüsselt gespeichert (Restic/Borg).
6. **Löschkonzept**: Obsidian-Akten sind nur eine Sicht auf die DB. Bei Löschung in der DB verschwinden sie aus dem System.

## Betroffenenrechte
Auskunftsersuchen und Löschaufforderungen können direkt über das Admin-Dashboard bearbeitet werden.
