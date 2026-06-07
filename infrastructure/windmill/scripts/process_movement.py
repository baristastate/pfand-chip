import os
import httpx

# Configuration for Supabase (usually provided via Windmill resources)
SUPABASE_URL = os.getenv("SUPABASE_URL", "http://supabase-db:54321")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Deposit Config
DEPOSIT_PRICES = {
    "10": 20.00,
    "30": 50.00,
    "200": 500.00
}

async def main(movement_id: str):
    """
    Triggers when a new movement is detected.
    Calculates deposit changes based on barrel status.
    """
    async with httpx.AsyncClient() as client:
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
        }

        # 1. Fetch movement details
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/barrel_movements?id=eq.{movement_id}&select=*,barrel:barrels(size_liters),customer_id",
            headers=headers
        )
        movement = res.json()[0]
        
        barrel_size = str(movement['barrel']['size_liters'])
        deposit_amount = DEPOSIT_PRICES.get(barrel_size, 0.00)
        customer_id = movement['customer_id']

        if not customer_id:
            return {"status": "skipped", "reason": "No customer associated"}

        # 2. Logic for DELIVERED / RETURNED
        transaction_type = None
        multiplier = 0

        if movement['to_status'] == 'DELIVERED':
            transaction_type = 'CHARGED'
            multiplier = 1 # Customer owes money
        elif movement['to_status'] == 'RETURNED':
            transaction_type = 'REFUND'
            multiplier = -1 # Refund money

        if transaction_type:
            final_amount = deposit_amount * multiplier
            
            # 3. Update Deposit Account
            # (Assuming account exists, otherwise create)
            await client.rpc("update_deposit_balance", {
                "p_customer_id": customer_id,
                "p_amount": final_amount
            }, headers=headers)

            # 4. Create Transaction Record
            await client.post(
                f"{SUPABASE_URL}/rest/v1/deposit_transactions",
                json={
                    "account_id": None, # Should be looked up or handle via RPC
                    "amount": final_amount,
                    "transaction_type": transaction_type,
                    "reference_movement_id": movement_id
                },
                headers=headers
            )

            return {"status": "success", "amount": final_amount, "type": transaction_type}
        
    return {"status": "no_action_required"}
