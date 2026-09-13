begin;

create extension if not exists pgcrypto;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  invoice_date date not null default current_date,
  due_date date,
  customer_name text not null,
  customer_whatsapp text not null,
  customer_address text,
  status text not null default 'draft',
  payment_status text not null default 'unpaid',
  payment_method text,
  paid_at timestamptz,
  notes text,
  subtotal bigint not null default 0,
  discount bigint not null default 0,
  delivery_fee bigint not null default 0,
  other_fee bigint not null default 0,
  grand_total bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_invoice_number_not_blank check (length(btrim(invoice_number)) > 0),
  constraint invoices_customer_name_not_blank check (length(btrim(customer_name)) > 0),
  constraint invoices_customer_whatsapp_not_blank check (length(btrim(customer_whatsapp)) > 0),
  constraint invoices_status_check check (status in ('draft', 'issued', 'cancelled')),
  constraint invoices_payment_status_check check (payment_status in ('unpaid', 'paid')),
  constraint invoices_subtotal_nonnegative check (subtotal >= 0),
  constraint invoices_discount_nonnegative check (discount >= 0),
  constraint invoices_delivery_fee_nonnegative check (delivery_fee >= 0),
  constraint invoices_other_fee_nonnegative check (other_fee >= 0),
  constraint invoices_grand_total_nonnegative check (grand_total >= 0),
  constraint invoices_discount_within_subtotal check (discount <= subtotal),
  constraint invoices_grand_total_matches_components
    check (grand_total = subtotal - discount + delivery_fee + other_fee)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  description text,
  qty integer not null,
  unit_price bigint not null,
  line_total bigint not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_items_product_name_not_blank check (length(btrim(product_name)) > 0),
  constraint invoice_items_qty_positive check (qty > 0),
  constraint invoice_items_unit_price_nonnegative check (unit_price >= 0),
  constraint invoice_items_line_total_matches check (line_total = qty::bigint * unit_price)
);

create index if not exists invoices_invoice_date_idx
  on public.invoices (invoice_date desc);
create index if not exists invoices_status_invoice_date_idx
  on public.invoices (status, invoice_date desc);
create index if not exists invoices_payment_status_invoice_date_idx
  on public.invoices (payment_status, invoice_date desc);
create index if not exists invoices_customer_whatsapp_idx
  on public.invoices (customer_whatsapp);
create index if not exists invoice_items_invoice_id_sort_order_idx
  on public.invoice_items (invoice_id, sort_order);
create index if not exists invoice_items_product_id_idx
  on public.invoice_items (product_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists invoice_items_set_updated_at on public.invoice_items;
create trigger invoice_items_set_updated_at
before update on public.invoice_items
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

revoke all on public.invoices from anon, authenticated;
revoke all on public.invoice_items from anon, authenticated;
grant select on public.invoices to authenticated;
grant select on public.invoice_items to authenticated;

create policy "Admins can read invoices"
on public.invoices for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can read invoice items"
on public.invoice_items for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.create_invoice(
  p_invoice_date date,
  p_due_date date,
  p_customer_name text,
  p_customer_whatsapp text,
  p_customer_address text,
  p_discount bigint,
  p_delivery_fee bigint,
  p_other_fee bigint,
  p_notes text,
  p_items jsonb
)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period text;
  v_sequence integer;
  v_invoice_number text;
  v_invoice_id uuid;
  v_subtotal bigint;
  v_grand_total bigint;
  v_item_count integer;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Admin access is required.';
  end if;
  if p_invoice_date is null or length(btrim(coalesce(p_customer_name, ''))) = 0
     or length(btrim(coalesce(p_customer_whatsapp, ''))) = 0 then
    raise exception using errcode = '23514', message = 'Invoice header is incomplete.';
  end if;
  if coalesce(jsonb_typeof(p_items), '') <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception using errcode = '23514', message = 'An invoice requires at least one item.';
  end if;
  if coalesce(p_discount, 0) < 0 or coalesce(p_delivery_fee, 0) < 0 or coalesce(p_other_fee, 0) < 0 then
    raise exception using errcode = '23514', message = 'Invoice adjustments cannot be negative.';
  end if;
  v_item_count := jsonb_array_length(p_items);

  v_period := to_char(p_invoice_date, 'YYYYMM');
  perform pg_advisory_xact_lock(hashtext('biorona-invoice-number:' || v_period));
  select coalesce(max(right(invoice_number, 4)::integer), 0) + 1
  into v_sequence
  from public.invoices
  where invoice_number like ('INV-BIO-' || v_period || '-____')
    and right(invoice_number, 4) ~ '^[0-9]{4}$';
  if v_sequence > 9999 then
    raise exception using errcode = '22003', message = 'Monthly invoice sequence is exhausted.';
  end if;
  v_invoice_number := format('INV-BIO-%s-%s', v_period, lpad(v_sequence::text, 4, '0'));

  insert into public.invoices (
    invoice_number, invoice_date, due_date, customer_name, customer_whatsapp,
    customer_address, discount, delivery_fee, other_fee, notes
  ) values (
    v_invoice_number, p_invoice_date, p_due_date, btrim(p_customer_name), btrim(p_customer_whatsapp),
    nullif(btrim(p_customer_address), ''), coalesce(p_discount, 0), coalesce(p_delivery_fee, 0),
    coalesce(p_other_fee, 0), nullif(btrim(p_notes), '')
  ) returning invoices.id into v_invoice_id;

  insert into public.invoice_items (
    invoice_id, product_id, product_name, description, qty, unit_price, line_total, sort_order
  )
  select
    v_invoice_id,
    nullif(item.value ->> 'product_id', '')::uuid,
    btrim(item.value ->> 'product_name'),
    nullif(btrim(item.value ->> 'description'), ''),
    (item.value ->> 'qty')::integer,
    (item.value ->> 'unit_price')::bigint,
    (item.value ->> 'qty')::bigint * (item.value ->> 'unit_price')::bigint,
    coalesce((item.value ->> 'sort_order')::integer, item.position - 1)
  from jsonb_array_elements(p_items) with ordinality as item(value, position)
  where length(btrim(coalesce(item.value ->> 'product_name', ''))) > 0
    and (item.value ->> 'qty')::integer > 0
    and (item.value ->> 'unit_price')::bigint >= 0;

  if (select count(*) from public.invoice_items where invoice_id = v_invoice_id) <> v_item_count then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;

  select coalesce(sum(line_total), 0) into v_subtotal
  from public.invoice_items where invoice_id = v_invoice_id;
  if v_subtotal = 0 and not exists (select 1 from public.invoice_items where invoice_id = v_invoice_id) then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;
  if coalesce(p_discount, 0) > v_subtotal then
    raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.';
  end if;
  v_grand_total := v_subtotal - coalesce(p_discount, 0) + coalesce(p_delivery_fee, 0) + coalesce(p_other_fee, 0);
  update public.invoices
  set subtotal = v_subtotal, grand_total = v_grand_total
  where invoices.id = v_invoice_id;

  return query select v_invoice_id, v_invoice_number, v_grand_total;
end;
$$;

create or replace function public.update_invoice_draft(
  p_invoice_id uuid,
  p_invoice_date date,
  p_due_date date,
  p_customer_name text,
  p_customer_whatsapp text,
  p_customer_address text,
  p_discount bigint,
  p_delivery_fee bigint,
  p_other_fee bigint,
  p_notes text,
  p_items jsonb
)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_number text;
  v_subtotal bigint;
  v_grand_total bigint;
  v_item_count integer;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Admin access is required.';
  end if;
  if p_invoice_id is null or p_invoice_date is null or length(btrim(coalesce(p_customer_name, ''))) = 0
     or length(btrim(coalesce(p_customer_whatsapp, ''))) = 0 then
    raise exception using errcode = '23514', message = 'Invoice header is incomplete.';
  end if;
  if coalesce(jsonb_typeof(p_items), '') <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception using errcode = '23514', message = 'An invoice requires at least one item.';
  end if;
  if coalesce(p_discount, 0) < 0 or coalesce(p_delivery_fee, 0) < 0 or coalesce(p_other_fee, 0) < 0 then
    raise exception using errcode = '23514', message = 'Invoice adjustments cannot be negative.';
  end if;
  v_item_count := jsonb_array_length(p_items);

  select invoices.invoice_number into v_invoice_number
  from public.invoices
  where invoices.id = p_invoice_id and invoices.status = 'draft'
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'Only an existing draft invoice can be edited.';
  end if;
  if substring(v_invoice_number from '^INV-BIO-([0-9]{6})-[0-9]{4}$')
       is distinct from to_char(p_invoice_date, 'YYYYMM') then
    raise exception using errcode = '23514', message = 'Invoice date cannot move to a different invoice-number month.';
  end if;

  delete from public.invoice_items where invoice_id = p_invoice_id;
  insert into public.invoice_items (
    invoice_id, product_id, product_name, description, qty, unit_price, line_total, sort_order
  )
  select
    p_invoice_id,
    nullif(item.value ->> 'product_id', '')::uuid,
    btrim(item.value ->> 'product_name'),
    nullif(btrim(item.value ->> 'description'), ''),
    (item.value ->> 'qty')::integer,
    (item.value ->> 'unit_price')::bigint,
    (item.value ->> 'qty')::bigint * (item.value ->> 'unit_price')::bigint,
    coalesce((item.value ->> 'sort_order')::integer, item.position - 1)
  from jsonb_array_elements(p_items) with ordinality as item(value, position)
  where length(btrim(coalesce(item.value ->> 'product_name', ''))) > 0
    and (item.value ->> 'qty')::integer > 0
    and (item.value ->> 'unit_price')::bigint >= 0;

  if (select count(*) from public.invoice_items where invoice_id = p_invoice_id) <> v_item_count then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;

  select coalesce(sum(line_total), 0) into v_subtotal
  from public.invoice_items where invoice_id = p_invoice_id;
  if v_subtotal = 0 and not exists (select 1 from public.invoice_items where invoice_id = p_invoice_id) then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;
  if coalesce(p_discount, 0) > v_subtotal then
    raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.';
  end if;
  v_grand_total := v_subtotal - coalesce(p_discount, 0) + coalesce(p_delivery_fee, 0) + coalesce(p_other_fee, 0);

  update public.invoices
  set invoice_date = p_invoice_date,
      due_date = p_due_date,
      customer_name = btrim(p_customer_name),
      customer_whatsapp = btrim(p_customer_whatsapp),
      customer_address = nullif(btrim(p_customer_address), ''),
      discount = coalesce(p_discount, 0),
      delivery_fee = coalesce(p_delivery_fee, 0),
      other_fee = coalesce(p_other_fee, 0),
      notes = nullif(btrim(p_notes), ''),
      subtotal = v_subtotal,
      grand_total = v_grand_total
  where invoices.id = p_invoice_id;

  return query select p_invoice_id, v_invoice_number, v_grand_total;
end;
$$;

create or replace function public.issue_invoice(p_invoice_id uuid)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Admin access is required.';
  end if;
  return query
  update public.invoices
  set status = 'issued'
  where invoices.id = p_invoice_id and invoices.status = 'draft'
  returning invoices.id, invoices.invoice_number, invoices.grand_total;
  if not found then
    raise exception using errcode = 'P0001', message = 'Only a draft invoice can be issued.';
  end if;
end;
$$;

create or replace function public.cancel_invoice(p_invoice_id uuid)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Admin access is required.';
  end if;
  return query
  update public.invoices
  set status = 'cancelled'
  where invoices.id = p_invoice_id and invoices.status in ('draft', 'issued')
  returning invoices.id, invoices.invoice_number, invoices.grand_total;
  if not found then
    raise exception using errcode = 'P0001', message = 'Only a draft or issued invoice can be cancelled.';
  end if;
end;
$$;

create or replace function public.mark_invoice_paid(
  p_invoice_id uuid,
  p_payment_method text default null
)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Admin access is required.';
  end if;
  return query
  update public.invoices
  set payment_status = 'paid',
      paid_at = now(),
      payment_method = nullif(btrim(p_payment_method), '')
  where invoices.id = p_invoice_id
    and invoices.status = 'issued'
    and invoices.payment_status = 'unpaid'
  returning invoices.id, invoices.invoice_number, invoices.grand_total;
  if not found then
    raise exception using errcode = 'P0001', message = 'Only an unpaid issued invoice can be marked paid.';
  end if;
end;
$$;

revoke all on function public.create_invoice(date, date, text, text, text, bigint, bigint, bigint, text, jsonb) from public, anon;
revoke all on function public.update_invoice_draft(uuid, date, date, text, text, text, bigint, bigint, bigint, text, jsonb) from public, anon;
revoke all on function public.issue_invoice(uuid) from public, anon;
revoke all on function public.cancel_invoice(uuid) from public, anon;
revoke all on function public.mark_invoice_paid(uuid, text) from public, anon;
grant execute on function public.create_invoice(date, date, text, text, text, bigint, bigint, bigint, text, jsonb) to authenticated;
grant execute on function public.update_invoice_draft(uuid, date, date, text, text, text, bigint, bigint, bigint, text, jsonb) to authenticated;
grant execute on function public.issue_invoice(uuid) to authenticated;
grant execute on function public.cancel_invoice(uuid) to authenticated;
grant execute on function public.mark_invoice_paid(uuid, text) to authenticated;

commit;
