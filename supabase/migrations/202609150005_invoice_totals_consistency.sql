begin;

alter table public.invoices rename column discount to discount_amount;
alter table public.invoices rename column other_fee to adjustment_amount;
alter table public.invoices add column if not exists tax_amount bigint not null default 0;

alter table public.invoices drop constraint invoices_grand_total_matches_components;
alter table public.invoices add constraint invoices_grand_total_matches_components
  check (grand_total = subtotal + delivery_fee + tax_amount + adjustment_amount - discount_amount);
alter table public.invoices add constraint invoices_tax_amount_nonnegative check (tax_amount >= 0);
alter table public.invoices add constraint invoices_adjustment_amount_nonnegative check (adjustment_amount >= 0);

drop function public.create_invoice(date, date, text, text, text, bigint, bigint, bigint, text, jsonb);
drop function public.update_invoice_draft(uuid, date, date, text, text, text, bigint, bigint, bigint, text, jsonb);

create function public.create_invoice(
  p_invoice_date date, p_due_date date, p_customer_name text, p_customer_whatsapp text,
  p_customer_address text, p_discount_amount bigint, p_delivery_fee bigint, p_tax_amount bigint,
  p_adjustment_amount bigint, p_notes text, p_items jsonb
)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_period text; v_sequence integer; v_invoice_number text; v_invoice_id uuid;
  v_subtotal bigint; v_grand_total bigint; v_item_count integer;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception using errcode = '42501', message = 'Admin access is required.'; end if;
  if p_invoice_date is null or length(btrim(coalesce(p_customer_name, ''))) = 0 or length(btrim(coalesce(p_customer_whatsapp, ''))) = 0 then raise exception using errcode = '23514', message = 'Invoice header is incomplete.'; end if;
  if coalesce(jsonb_typeof(p_items), '') <> 'array' or jsonb_array_length(p_items) = 0 then raise exception using errcode = '23514', message = 'An invoice requires at least one item.'; end if;
  if coalesce(p_discount_amount, 0) < 0 or coalesce(p_delivery_fee, 0) < 0 or coalesce(p_tax_amount, 0) < 0 or coalesce(p_adjustment_amount, 0) < 0 then raise exception using errcode = '23514', message = 'Invoice adjustments cannot be negative.'; end if;
  v_item_count := jsonb_array_length(p_items); v_period := to_char(p_invoice_date, 'YYYYMM');
  perform pg_advisory_xact_lock(hashtext('biorona-invoice-number:' || v_period));
  select coalesce(max(right(i.invoice_number, 4)::integer), 0) + 1 into v_sequence from public.invoices as i where i.invoice_number like ('INV-BIO-' || v_period || '-____') and right(i.invoice_number, 4) ~ '^[0-9]{4}$';
  if v_sequence > 9999 then raise exception using errcode = '22003', message = 'Monthly invoice sequence is exhausted.'; end if;
  v_invoice_number := format('INV-BIO-%s-%s', v_period, lpad(v_sequence::text, 4, '0'));
  insert into public.invoices (invoice_number, invoice_date, due_date, customer_name, customer_whatsapp, customer_address, discount_amount, delivery_fee, tax_amount, adjustment_amount, notes)
  values (v_invoice_number, p_invoice_date, p_due_date, btrim(p_customer_name), btrim(p_customer_whatsapp), nullif(btrim(p_customer_address), ''), 0, 0, 0, 0, nullif(btrim(p_notes), '')) returning invoices.id into v_invoice_id;
  insert into public.invoice_items (invoice_id, product_id, product_name, description, qty, unit_price, line_total, sort_order)
  select v_invoice_id, nullif(item.value ->> 'product_id', '')::uuid, btrim(item.value ->> 'product_name'), nullif(btrim(item.value ->> 'description'), ''), (item.value ->> 'qty')::integer, (item.value ->> 'unit_price')::bigint, (item.value ->> 'qty')::bigint * (item.value ->> 'unit_price')::bigint, coalesce((item.value ->> 'sort_order')::integer, item.position - 1)
  from jsonb_array_elements(p_items) with ordinality as item(value, position)
  where length(btrim(coalesce(item.value ->> 'product_name', ''))) > 0 and (item.value ->> 'qty')::integer > 0 and (item.value ->> 'unit_price')::bigint >= 0;
  if (select count(*) from public.invoice_items where invoice_id = v_invoice_id) <> v_item_count then raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.'; end if;
  select coalesce(sum(line_total), 0) into v_subtotal from public.invoice_items where invoice_id = v_invoice_id;
  if coalesce(p_discount_amount, 0) > v_subtotal then raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.'; end if;
  v_grand_total := v_subtotal + coalesce(p_delivery_fee, 0) + coalesce(p_tax_amount, 0) + coalesce(p_adjustment_amount, 0) - coalesce(p_discount_amount, 0);
  update public.invoices set subtotal = v_subtotal, discount_amount = coalesce(p_discount_amount, 0), delivery_fee = coalesce(p_delivery_fee, 0), tax_amount = coalesce(p_tax_amount, 0), adjustment_amount = coalesce(p_adjustment_amount, 0), grand_total = v_grand_total where invoices.id = v_invoice_id;
  return query select v_invoice_id, v_invoice_number, v_grand_total;
end;
$$;

create function public.update_invoice_draft(
  p_invoice_id uuid, p_invoice_date date, p_due_date date, p_customer_name text, p_customer_whatsapp text,
  p_customer_address text, p_discount_amount bigint, p_delivery_fee bigint, p_tax_amount bigint,
  p_adjustment_amount bigint, p_notes text, p_items jsonb
)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_invoice_number text; v_subtotal bigint; v_grand_total bigint; v_item_count integer;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception using errcode = '42501', message = 'Admin access is required.'; end if;
  if p_invoice_id is null or p_invoice_date is null or length(btrim(coalesce(p_customer_name, ''))) = 0 or length(btrim(coalesce(p_customer_whatsapp, ''))) = 0 then raise exception using errcode = '23514', message = 'Invoice header is incomplete.'; end if;
  if coalesce(jsonb_typeof(p_items), '') <> 'array' or jsonb_array_length(p_items) = 0 then raise exception using errcode = '23514', message = 'An invoice requires at least one item.'; end if;
  if coalesce(p_discount_amount, 0) < 0 or coalesce(p_delivery_fee, 0) < 0 or coalesce(p_tax_amount, 0) < 0 or coalesce(p_adjustment_amount, 0) < 0 then raise exception using errcode = '23514', message = 'Invoice adjustments cannot be negative.'; end if;
  v_item_count := jsonb_array_length(p_items);
  select i.invoice_number into v_invoice_number from public.invoices as i where i.id = p_invoice_id and i.status = 'draft' for update;
  if not found then raise exception using errcode = 'P0001', message = 'Only an existing draft invoice can be edited.'; end if;
  delete from public.invoice_items where invoice_id = p_invoice_id;
  insert into public.invoice_items (invoice_id, product_id, product_name, description, qty, unit_price, line_total, sort_order)
  select p_invoice_id, nullif(item.value ->> 'product_id', '')::uuid, btrim(item.value ->> 'product_name'), nullif(btrim(item.value ->> 'description'), ''), (item.value ->> 'qty')::integer, (item.value ->> 'unit_price')::bigint, (item.value ->> 'qty')::bigint * (item.value ->> 'unit_price')::bigint, coalesce((item.value ->> 'sort_order')::integer, item.position - 1)
  from jsonb_array_elements(p_items) with ordinality as item(value, position)
  where length(btrim(coalesce(item.value ->> 'product_name', ''))) > 0 and (item.value ->> 'qty')::integer > 0 and (item.value ->> 'unit_price')::bigint >= 0;
  if (select count(*) from public.invoice_items where invoice_id = p_invoice_id) <> v_item_count then raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.'; end if;
  select coalesce(sum(line_total), 0) into v_subtotal from public.invoice_items where invoice_id = p_invoice_id;
  if coalesce(p_discount_amount, 0) > v_subtotal then raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.'; end if;
  v_grand_total := v_subtotal + coalesce(p_delivery_fee, 0) + coalesce(p_tax_amount, 0) + coalesce(p_adjustment_amount, 0) - coalesce(p_discount_amount, 0);
  update public.invoices set invoice_date = p_invoice_date, due_date = p_due_date, customer_name = btrim(p_customer_name), customer_whatsapp = btrim(p_customer_whatsapp), customer_address = nullif(btrim(p_customer_address), ''), discount_amount = coalesce(p_discount_amount, 0), delivery_fee = coalesce(p_delivery_fee, 0), tax_amount = coalesce(p_tax_amount, 0), adjustment_amount = coalesce(p_adjustment_amount, 0), notes = nullif(btrim(p_notes), ''), subtotal = v_subtotal, grand_total = v_grand_total where invoices.id = p_invoice_id;
  return query select p_invoice_id, v_invoice_number, v_grand_total;
end;
$$;

revoke all on function public.create_invoice(date, date, text, text, text, bigint, bigint, bigint, bigint, text, jsonb) from public, anon;
revoke all on function public.update_invoice_draft(uuid, date, date, text, text, text, bigint, bigint, bigint, bigint, text, jsonb) from public, anon;
grant execute on function public.create_invoice(date, date, text, text, text, bigint, bigint, bigint, bigint, text, jsonb) to authenticated;
grant execute on function public.update_invoice_draft(uuid, date, date, text, text, text, bigint, bigint, bigint, bigint, text, jsonb) to authenticated;

commit;