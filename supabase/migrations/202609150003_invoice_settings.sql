begin;

create extension if not exists pgcrypto;

create table if not exists public.invoice_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Biorona Florist',
  business_address text,
  business_whatsapp text,
  business_email text,
  bank_name text,
  bank_account_number text,
  bank_account_name text,
  payment_note text,
  footer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_settings_business_name_not_blank check (length(btrim(business_name)) > 0)
);

create unique index if not exists invoice_settings_singleton_idx
  on public.invoice_settings ((true));

insert into public.invoice_settings (business_name)
values ('Biorona Florist')
on conflict do nothing;

drop trigger if exists invoice_settings_set_updated_at on public.invoice_settings;
create trigger invoice_settings_set_updated_at
before update on public.invoice_settings
for each row execute function public.set_updated_at();

alter table public.invoice_settings enable row level security;
revoke all on public.invoice_settings from anon, authenticated;
grant select, update on public.invoice_settings to authenticated;

create policy "Admins can read invoice settings"
on public.invoice_settings for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update invoice settings"
on public.invoice_settings for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
