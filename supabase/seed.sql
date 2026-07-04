-- Local development seed (Supabase CLI only; NOT applied to production via `supabase db push`).
--
-- Hosted Supabase automatically grants full DML on the `public` schema to the
-- `anon`, `authenticated`, and `service_role` roles. Some local CLI images ship
-- hardened default privileges that only grant Dxtm (TRUNCATE/REFERENCES/TRIGGER/
-- MAINTAIN), which breaks inserts/selects even though the migration's RLS policies
-- are correct. Re-grant here so the local stack mirrors production behaviour.
-- Row Level Security still restricts every role to its own rows.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
