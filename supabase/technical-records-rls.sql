-- MT-1P V5.5.2 — Technical Records RLS
-- Admin: SELECT/INSERT/UPDATE/DELETE
-- Manager: SELECT/INSERT/UPDATE
-- Staff/Viewer: SELECT

alter table public.technical_records enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname='public' and tablename='technical_records'
  loop
    execute format('drop policy if exists %I on public.technical_records', p.policyname);
  end loop;
end $$;

create policy "technical_records_select_active"
on public.technical_records
for select to authenticated
using (get_my_role() in ('admin','manager','staff','viewer'));

create policy "technical_records_insert_admin_manager"
on public.technical_records
for insert to authenticated
with check (
  get_my_role() in ('admin','manager')
  and created_by = auth.uid()
);

create policy "technical_records_update_admin_manager"
on public.technical_records
for update to authenticated
using (get_my_role() in ('admin','manager'))
with check (get_my_role() in ('admin','manager'));

create policy "technical_records_delete_admin_only"
on public.technical_records
for delete to authenticated
using (get_my_role() = 'admin');

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and tablename='technical_records'
order by cmd, policyname;
