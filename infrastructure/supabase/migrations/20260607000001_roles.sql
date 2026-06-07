-- Create Application Roles
do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'admin') then
    create role admin;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'lager') then
    create role lager;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'gastro') then
    create role gastro;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'fahrer') then
    create role fahrer;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'produktion') then
    create role produktion;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'buchhaltung') then
    create role buchhaltung;
  end if;
end
$$;

-- Note: In Supabase, these are usually mapped to auth identities.
