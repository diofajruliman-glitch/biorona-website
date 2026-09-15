-- Update invoice data and totals for any invoice status; admin-only RPCs.
begin;

create function public.update_invoice(
  p_invoice_id uuid, p_invoice_date date, p_due_date date, p_customer_name text, p_customer_whatsapp text,
  p_customer_address text, p_discount_amount bigint, p_delivery_fee bigint, p_tax_amount bigint,
  p_adjustment_amount bigint, p_notes text, p_status text, p_payment_status text,
  p_payment_method text, p_confirm_paid boolean, p_items jsonb
)
returns table (id uuid, invoice_number text, grand_total bigint)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_invoice_number text; v_existing_payment_status text; v_subtotal bigint; v_grand_total bigint; v_item_count integer;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception using errcode = '42501', message = 'Admin access is required.'; end if;
  if p_invoice_id is null or p_invoice_date is null or length(btrim(coalesce(p_customer_name, ''))) = 0 or length(btrim(coalesce(p_customer_whatsapp, ''))) = 0 then raise exception using errcode = '23514', message = 'Invoice header is incomplete.'; end if;
  if p_status not in ('draft', 'issued', 'cancelled') or p_payment_status not in ('unpaid', 'paid') then raise exception using errcode = '23514', message = 'Invoice status is invalid.'; end if;
  if p_payment_status = 'paid' and coalesce(p_confirm_paid, false) is not true then raise exception using errcode = '23514', message = 'Editing a paid invoice requires confirmation.'; end if;
  if coalesce(jsonb_typeof(p_items), '') <> 'array' or jsonb_array_length(p_items) = 0 then raise exception using errcode = '23514', message = 'An invoice requires at least one item.'; end if;
  if coalesce(p_discount_amount, 0) < 0 or coalesce(p_delivery_fee, 0) < 0 or coalesce(p_tax_amount, 0) < 0 or coalesce(p_adjustment_amount, 0) < 0 then raise exception using errcode = '23514', message = 'Invoice adjustments cannot be negative.'; end if;
  v_item_count := jsonb_array_length(p_items);
  select i.invoice_number, i.payment_status into v_invoice_number, v_existing_payment_status from public.invoices as i where i.id = p_invoice_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'Invoice tidak ditemukan.'; end if;
  if v_existing_payment_status = 'paid' and coalesce(p_confirm_paid, false) is not true then raise exception using errcode = '23514', message = 'Editing a paid invoice requires confirmation.'; end if;
  delete from public.invoice_items where invoice_id = p_invoice_id;
  insert into public.invoice_items (invoice_id, product_id, product_name, description, qty, unit_price, line_total, sort_order)
  select p_invoice_id, nullif(item.value ->> 'product_id', '')::uuid, btrim(item.value ->> 'product_name'), nullif(btrim(item.value ->> 'description'), ''), (item.value ->> 'qty')::integer, (item.value ->> 'unit_price')::bigint, (item.value ->> 'qty')::bigint * (item.value ->> 'unit_price')::bigint, coalesce((item.value ->> 'sort_order')::integer, item.position - 1)
  from jsonb_array_elements(p_items) with ordinality as item(value, position)
  where length(btrim(coalesce(item.value ->> 'product_name', ''))) > 0 and (item.value ->> 'qty')::integer > 0 and (item.value ->> 'unit_price')::bigint >= 0;
  if (select count(*) from public.invoice_items where invoice_id = p_invoice_id) <> v_item_count then raise exception using errcode = '23514', message = 'Every invoice item must have a name, positive quantity, and nonnegative price.'; end if;
  select coalesce(sum(line_total), 0) into v_subtotal from public.invoice_items where invoice_id = p_invoice_id;
  if coalesce(p_discount_amount, 0) > v_subtotal then raise exception using errcode = '23514', message = 'Discount cannot exceed subtotal.'; end if;
  v_grand_total := v_subtotal + coalesce(p_delivery_fee, 0) + coalesce(p_tax_amount, 0) + coalesce(p_adjustment_amount, 0) - coalesce(p_discount_amount, 0);
  update public.invoices set invoice_date = p_invoice_date, due_date = p_due_date, customer_name = btrim(p_customer_name), customer_whatsapp = btrim(p_customer_whatsapp), customer_address = nullif(btrim(p_customer_address), ''), discount_amount = coalesce(p_discount_amount, 0), delivery_fee = coalesce(p_delivery_fee, 0), tax_amount = coalesce(p_tax_amount, 0), adjustment_amount = coalesce(p_adjustment_amount, 0), notes = nullif(btrim(p_notes), ''), status = p_status, payment_status = p_payment_status, payment_method = nullif(btrim(p_payment_method), ''), paid_at = case when p_payment_status = 'paid' then coalesce(paid_at, now()) else null end, subtotal = v_subtotal, grand_total = v_grand_total where invoices.id = p_invoice_id;
  return query select p_invoice_id, v_invoice_number, v_grand_total;
end;
$$;

revoke all on function public.update_invoice(uuid, date, date, text, text, text, bigint, bigint, bigint, bigint, text, text, text, text, boolean, jsonb) from public, anon;
grant execute on function public.update_invoice(uuid, date, date, text, text, text, bigint, bigint, bigint, bigint, text, text, text, text, boolean, jsonb) to authenticated;

create or replace function public.delete_invoice(p_invoice_id uuid)
returns void
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_status text;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then raise exception using errcode = '42501', message = 'Admin access is required.'; end if;

  select status into v_status
  from public.invoices
  where id = p_invoice_id
  for update;

  if not found then raise exception using errcode = 'P0001', message = 'Invoice tidak ditemukan.'; end if;
  if v_status not in ('issued', 'cancelled') then
    raise exception using errcode = '23514', message = 'Hanya invoice Terbit atau Batal yang dapat dihapus.';
  end if;

  delete from public.invoice_items where invoice_id = p_invoice_id;
  delete from public.invoices where id = p_invoice_id;
  if not found then raise exception using errcode = 'P0001', message = 'Invoice tidak ditemukan.'; end if;
end;
$$;

revoke all on function public.delete_invoice(uuid) from public, anon;
grant execute on function public.delete_invoice(uuid) to authenticated;

commit;