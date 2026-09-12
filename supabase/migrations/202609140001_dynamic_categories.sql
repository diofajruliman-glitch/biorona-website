begin;

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (length(btrim(name)) > 0),
  constraint categories_slug_not_blank check (length(btrim(slug)) > 0),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

alter table public.products
  add column if not exists category_id uuid references public.categories(id) on delete restrict;

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order, name);

create index if not exists products_category_id_idx
  on public.products (category_id)
  where category_id is not null;

create or replace function public.slugify_category_name(value text)
returns text
language sql
set search_path = ''
as $$
  select lower(
    regexp_replace(
      regexp_replace(
        trim(value),
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
$$;

create or replace function public.prevent_category_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  product_count integer;
begin
  select count(*) into product_count
  from public.products
  where category_id = old.id;

  if product_count > 0 then
    raise exception 'Kategori ini masih digunakan oleh % produk.', product_count;
  end if;

  return old;
end;
$$;

with unique_categories as (
  select
    distinct trim(category) as category_name,
    public.slugify_category_name(trim(category)) as slug_name
  from public.products
  where length(btrim(category)) > 0
), mapped_categories as (
  insert into public.categories (name, slug, description, is_active, sort_order)
  select
    category_name,
    case
      when slug_name = '' then 'kategori'
      else slug_name
    end,
    null,
    true,
    0
  from unique_categories
  on conflict (slug) do nothing
  returning id, name, slug
)
update public.products p
set category_id = mc.id,
    category = mc.name
from mapped_categories mc
where p.category_id is null
  and p.category is not null
  and length(btrim(p.category)) > 0
  and public.slugify_category_name(trim(p.category)) = mc.slug;

update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and length(btrim(p.category)) > 0
  and c.slug = public.slugify_category_name(trim(p.category));

alter table public.products
  alter column category_id set not null;

alter table public.categories enable row level security;
alter table public.products enable row level security;

revoke all on public.categories from anon, authenticated;
revoke all on public.products from anon, authenticated;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Keep legacy category text available only for safety while migration is active.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (is_active = true or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop trigger if exists categories_prevent_delete on public.categories;
create trigger categories_prevent_delete
before delete on public.categories
for each row execute function public.prevent_category_delete();

commit;
