begin;

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists sort_order integer default 0;
alter table public.categories add column if not exists is_active boolean default true;
alter table public.categories add column if not exists created_at timestamptz default now();
alter table public.categories add column if not exists updated_at timestamptz default now();
alter table public.products add column if not exists category_id uuid;

create or replace function public.slugify_category_name(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(
    regexp_replace(
      regexp_replace(trim(value), '[^a-zA-Z0-9]+', '-', 'g'),
      '^-+|-+$',
      '',
      'g'
    )
  );
$$;

-- Rapikan data categories yang mungkin sudah terbentuk sebagian.
update public.categories
set name = concat('Kategori ', substr(id::text, 1, 8))
where name is null or length(btrim(name)) = 0;

update public.categories
set slug = concat(
  coalesce(nullif(public.slugify_category_name(name), ''), 'kategori'),
  '-',
  substr(id::text, 1, 8)
)
where slug is null
   or length(btrim(slug)) = 0
   or slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$';

-- Pastikan duplicate slug lama menjadi unik sebelum unique index dibuat.
with duplicate_slugs as (
  select
    id,
    slug,
    row_number() over (partition by slug order by id) as duplicate_number
  from public.categories
)
update public.categories c
set slug = concat(c.slug, '-', substr(c.id::text, 1, 8))
from duplicate_slugs d
where c.id = d.id
  and d.duplicate_number > 1;

update public.categories set sort_order = 0 where sort_order is null;
update public.categories set is_active = true where is_active is null;
update public.categories set created_at = now() where created_at is null;
update public.categories set updated_at = now() where updated_at is null;

alter table public.categories alter column name set not null;
alter table public.categories alter column slug set not null;

-- PENTING:
-- ON CONFLICT (slug) di bawah membutuhkan UNIQUE index/constraint atas slug.
-- Buat unique index SEBELUM INSERT legacy dijalankan.
do $$
begin
  -- Jika pernah ada index dengan nama yang sama tetapi bukan UNIQUE,
  -- hapus index tersebut supaya dapat dibuat ulang dengan benar.
  if to_regclass('public.categories_slug_unique_idx') is not null
     and not exists (
       select 1
       from pg_index i
       where i.indexrelid = to_regclass('public.categories_slug_unique_idx')
         and i.indisunique
     )
  then
    execute 'drop index public.categories_slug_unique_idx';
  end if;
end $$;

create unique index if not exists categories_slug_unique_idx
  on public.categories (slug);

-- Masukkan kategori lama dari products.category.
insert into public.categories (name, slug, description, sort_order, is_active)
select
  legacy.name,
  concat(
    coalesce(nullif(public.slugify_category_name(legacy.name), ''), 'kategori'),
    '-',
    substr(md5(lower(legacy.name)), 1, 8)
  ),
  null,
  0,
  true
from (
  select min(btrim(category)) as name
  from public.products
  where category is not null
    and length(btrim(category)) > 0
  group by lower(btrim(category))
) legacy
where not exists (
  select 1
  from public.categories c
  where lower(btrim(c.name)) = lower(legacy.name)
)
on conflict (slug) do nothing;

-- Bersihkan category_id orphan sebelum FK dipastikan.
update public.products p
set category_id = null
where category_id is not null
  and not exists (
    select 1
    from public.categories c
    where c.id = p.category_id
  );

-- Siapkan kategori fallback hanya bila memang ada produk tanpa kategori.
insert into public.categories (name, slug, description, sort_order, is_active)
select 'Tanpa kategori', 'tanpa-kategori', null, 9999, true
where exists (
  select 1
  from public.products
  where category_id is null
    and (category is null or length(btrim(category)) = 0)
)
and not exists (
  select 1
  from public.categories
  where lower(btrim(name)) = 'tanpa kategori'
)
on conflict (slug) do nothing;

-- Backfill category_id berdasarkan nama kategori legacy.
update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and p.category is not null
  and lower(btrim(p.category)) = lower(btrim(c.name));

-- Produk tanpa kategori diarahkan ke kategori fallback.
update public.products p
set category = 'Tanpa kategori',
    category_id = c.id
from public.categories c
where p.category_id is null
  and (p.category is null or length(btrim(p.category)) = 0)
  and lower(btrim(c.name)) = 'tanpa kategori';

-- Pastikan FK category_id benar.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname = 'products'
      and con.contype = 'f'
      and pg_get_constraintdef(con.oid) like 'FOREIGN KEY (category_id)%'
      and pg_get_constraintdef(con.oid) not like '%REFERENCES categories(id)%'
  loop
    execute format(
      'alter table public.products drop constraint %I',
      constraint_record.conname
    );
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_category_id_fkey'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id)
      references public.categories(id)
      on delete restrict
      not valid;
  end if;
end $$;

alter table public.products
  validate constraint products_category_id_fkey;

-- Stop dengan aman jika masih ada produk yang gagal dipetakan.
do $$
begin
  if exists (
    select 1
    from public.products
    where category_id is null
  ) then
    raise exception
      'Repair dihentikan: masih ada produk tanpa category_id yang dapat dipetakan.';
  end if;
end $$;

alter table public.products alter column category_id set not null;

alter table public.categories alter column sort_order set default 0;
alter table public.categories alter column sort_order set not null;
alter table public.categories alter column is_active set default true;
alter table public.categories alter column is_active set not null;
alter table public.categories alter column created_at set default now();
alter table public.categories alter column created_at set not null;
alter table public.categories alter column updated_at set default now();
alter table public.categories alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_name_not_blank'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_name_not_blank
      check (length(btrim(name)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_not_blank'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_slug_not_blank
      check (length(btrim(slug)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_format'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_slug_format
      check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  end if;
end $$;

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order, name);

create index if not exists products_category_id_idx
  on public.products (category_id);

do $$
begin
  if not exists (
    select 1
    from public.categories
    group by lower(btrim(name))
    having count(*) > 1
  ) then
    create unique index if not exists categories_name_unique_ci
      on public.categories (lower(btrim(name)));
  end if;
end $$;

create or replace function public.prevent_duplicate_category_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.categories
    where lower(btrim(name)) = lower(btrim(new.name))
      and id <> new.id
  ) then
    raise exception
      using errcode = '23505',
            message = 'Nama kategori sudah digunakan.';
  end if;

  return new;
end;
$$;

drop trigger if exists categories_prevent_duplicate_name
  on public.categories;

create trigger categories_prevent_duplicate_name
before insert or update of name on public.categories
for each row
execute function public.prevent_duplicate_category_name();

create or replace function public.prevent_category_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.products
    where category_id = old.id
  ) then
    raise exception
      using errcode = '23503',
            message = 'Kategori ini masih digunakan oleh produk.';
  end if;

  return old;
end;
$$;

drop trigger if exists categories_prevent_delete
  on public.categories;

create trigger categories_prevent_delete
before delete on public.categories
for each row
execute function public.prevent_category_delete();

create or replace function public.sync_product_legacy_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select name
  into new.category
  from public.categories
  where id = new.category_id;

  if new.category is null then
    raise exception
      using errcode = '23503',
            message = 'Kategori produk tidak valid atau sudah tidak tersedia.';
  end if;

  return new;
end;
$$;

-- TODO: drop products.category hanya setelah seluruh consumer legacy dihentikan.
drop trigger if exists products_sync_legacy_category
  on public.products;

create trigger products_sync_legacy_category
before insert or update of category_id on public.products
for each row
execute function public.sync_product_legacy_category();

create or replace function public.sync_category_legacy_products()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.products
  set category = new.name
  where category_id = new.id;

  return new;
end;
$$;

drop trigger if exists categories_sync_legacy_products
  on public.categories;

create trigger categories_sync_legacy_products
after update of name on public.categories
for each row
execute function public.sync_category_legacy_products();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at
  on public.categories;

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;

revoke all on public.categories from anon, authenticated;
revoke all on public.products from anon, authenticated;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

drop policy if exists "Public can read active categories"
  on public.categories;

create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (
  is_active = true
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can manage categories"
  on public.categories;

create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Public can read active products"
  on public.products;

create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (
  is_active = true
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can insert products"
  on public.products;

create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can update products"
  on public.products;

create policy "Admins can update products"
on public.products
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can delete products"
  on public.products;

create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

commit;
