"""
Windmill-Trigger: Neuer Vertrag mit status=ACCEPTED
Erstellt audit_log-Eintrag und verknüpft event_bookings.
"""
import os
import httpx

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def main(contract_id: str):
    with httpx.Client() as client:
        # Vertrag + Paket laden
        res = client.get(
            f"{SUPABASE_URL}/rest/v1/event_contracts",
            params={
                "id": f"eq.{contract_id}",
                "select": "*, tour_packages(name, event_type)",
            },
            headers=HEADERS,
        )
        res.raise_for_status()
        contracts = res.json()
        if not contracts:
            raise ValueError(f"Vertrag {contract_id} nicht gefunden")

        contract = contracts[0]
        pkg_name = contract.get("tour_packages", {}).get("name", "Unbekannt")

        # Audit-Log schreiben
        audit_payload = {
            "action": "CONTRACT_ACCEPTED",
            "table_name": "event_contracts",
            "record_id": contract_id,
            "new_values": {
                "contact_name": contract["contact_name"],
                "contact_email": contract["contact_email"],
                "package": pkg_name,
                "requested_date": contract["requested_date"],
                "participant_count": contract["participant_count"],
                "total_price": contract["total_price"],
            },
        }
        audit_res = client.post(
            f"{SUPABASE_URL}/rest/v1/audit_logs",
            json=audit_payload,
            headers=HEADERS,
        )
        audit_res.raise_for_status()

        print(f"Buchungsbestätigung verarbeitet: {contract_id} — {pkg_name} für {contract['contact_name']}")
        return {"status": "ok", "contract_id": contract_id}
