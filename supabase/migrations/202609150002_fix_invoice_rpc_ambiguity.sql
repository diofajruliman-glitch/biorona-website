begin;

create or replace function public.create_invoice(
  p_invoice_date date, p_due_date date, p_customer_name text, p_customer_whatsapp text,
  p_customer_address text, p_discount bigint, p_delivery_fee bigint, p_other_fee bigint,
  p_notes text, p_items jsonb
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
  select coalesce(max(right(i.invoice_number, 4)::integer), 0) + 1
  into v_sequence
  from public.invoices as i
  where i.invoice_number like ('INV-BIO-' || v_period || '-____')
    and right(i.invoice_number, 4) ~ '^[0-9]{4}$';
  if v_sequence > 9999 then
    raise exception using errcode = '22003', message = 'Monthly invoice sequence is exhausted.';
  end if;
  v_invoice_number := format('INV-BIO-%s-%s', v_period, lpad(v_sequence::text, 4, '0'));

  insert into public.invoices as i (
    invoice_number, invoice_date, due_date, customer_name, customer_whatsapp,
    customer_address, discount, delivery_fee, other_fee, notes
  ) values (
    v_invoice_number, p_invoice_date, p_due_date, btrim(p_customer_name), btrim(p_customer_whatsapp),
    nullif(btrim(p_customer_address), ''), coalesce(p_discount, 0), coalesce(p_delivery_fee, 0),
    coalesce(p_other_fee, 0), nullif(btrim(p_notes), '')
  ) returning i.id into v_invoice_id;

  insert into public.invoice_items as ii (
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

  if (select count(*) from public.invoice_items as ii where ii.invoice_id = v_invoice_id) <> v_item_count then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;
  select coalesce(sum(ii.line_total), 0) into v_subtotal
  from public.invoice_items as ii where ii.invoice_id = v_invoice_id;
  if v_subtotal = 0 and not exists (select 1 from public.invoice_items as ii where ii.invoice_id = v_invoice_id) then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;
  if coalesce(p_discount, 0) > v_subtotal then
    raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.';
  end if;
  v_grand_total := v_subtotal - coalesce(p_discount, 0) + coalesce(p_delivery_fee, 0) + coalesce(p_other_fee, 0);
  update public.invoices as i
  set subtotal = v_subtotal, grand_total = v_grand_total
  where i.id = v_invoice_id;

  return query
  select i.id, i.invoice_number, i.grand_total
  from public.invoices as i
  where i.id = v_invoice_id;
end;
$$;

create or replace function public.update_invoice_draft(
  p_invoice_id uuid, p_invoice_date date, p_due_date date, p_customer_name text,
  p_customer_whatsapp text, p_customer_address text, p_discount bigint,
  p_delivery_fee bigint, p_other_fee bigint, p_notes text, p_items jsonb
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

  select i.invoice_number into v_invoice_number
  from public.invoices as i
  where i.id = p_invoice_id and i.status = 'draft'
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'Only an existing draft invoice can be edited.';
  end if;
  if substring(v_invoice_number from '^INV-BIO-([0-9]{6})-[0-9]{4}$')
       is distinct from to_char(p_invoice_date, 'YYYYMM') then
    raise exception using errcode = '23514', message = 'Invoice date cannot move to a different invoice-number month.';
  end if;

  delete from public.invoice_items as ii where ii.invoice_id = p_invoice_id;
  insert into public.invoice_items as ii (
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

  if (select count(*) from public.invoice_items as ii where ii.invoice_id = p_invoice_id) <> v_item_count then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;
  select coalesce(sum(ii.line_total), 0) into v_subtotal
  from public.invoice_items as ii where ii.invoice_id = p_invoice_id;
  if v_subtotal = 0 and not exists (select 1 from public.invoice_items as ii where ii.invoice_id = p_invoice_id) then
    raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.';
  end if;
  if coalesce(p_discount, 0) > v_subtotal then
    raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.';
  end if;
  v_grand_total := v_subtotal - coalesce(p_discount, 0) + coalesce(p_delivery_fee, 0) + coalesce(p_other_fee, 0);

  update public.invoices as i
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
  where i.id = p_invoice_id;

  return query
  select i.id, i.invoice_number, i.grand_total
  from public.invoices as i
  where i.id = p_invoice_id;
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
  update public.invoices as i
  set status = 'issued'
  where i.id = p_invoice_id and i.status = 'draft'
  returning i.id, i.invoice_number, i.grand_total;
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
  update public.invoices as i
  set status = 'cancelled'
  where i.id = p_invoice_id and i.status in ('draft', 'issued')
  returning i.id, i.invoice_number, i.grand_total;
  if not found then
    raise exception using errcode = 'P0001', message = 'Only a draft or issued invoice can be cancelled.';
  end if;
end;
$$;

create or replace function public.mark_invoice_paid(p_invoice_id uuid, p_payment_method text default null)
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
  update public.invoices as i
  set payment_status = 'paid',
      paid_at = now(),
      payment_method = nullif(btrim(p_payment_method), '')
  where i.id = p_invoice_id
    and i.status = 'issued'
    and i.payment_status = 'unpaid'
  returning i.id, i.invoice_number, i.grand_total;
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
