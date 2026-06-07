-- Function to atomicly update deposit balance
create or replace function update_deposit_balance(p_customer_id uuid, p_amount numeric)
returns void as $$
begin
    -- Ensure account exists
    insert into deposit_accounts (customer_id, balance)
    values (p_customer_id, 0)
    on conflict (customer_id) do nothing;

    -- Update balance
    update deposit_accounts
    set balance = balance + p_amount,
        updated_at = now()
    where customer_id = p_customer_id;
end;
$$ language plpgsql security definer;
