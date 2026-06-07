import os
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

async def main(barrel_id: str, reported_by: str, description: str):
    """
    Triggers on a new damage report.
    Automatically moves barrel to MAINTENANCE status.
    """
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    }

    async with httpx.AsyncClient() as client:
        # 1. Update Barrel Status
        await client.patch(
            f"{SUPABASE_URL}/rest/v1/barrels?id=eq.{barrel_id}",
            json={"status": "MAINTENANCE"},
            headers=headers
        )

        # 2. Create Maintenance Record
        await client.post(
            f"{SUPABASE_URL}/rest/v1/maintenance_records",
            json={
                "barrel_id": barrel_id,
                "maintenance_type": "DAMAGE_REPAIR",
                "notes": f"Automatischer Eintrag nach Schadensmeldung: {description}",
                "performed_by": reported_by
            },
            headers=headers
        )

        return {"status": "barrel_moved_to_maintenance", "barrel_id": barrel_id}
