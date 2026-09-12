begin;

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name text not null,
  category text not null,
  price bigint not null check (price >= 0),
  original_price bigint check (original_price is null or original_price >= price),
  short_description text not null,
  description text not null,
  seo_description text not null,
  colors text[] not null default '{}',
  occasions text[] not null default '{}',
  tags text[] not null default '{}',
  available boolean not null default true,
  preorder boolean not null default false,
  featured boolean not null default false,
  bestseller boolean not null default false,
  lead_time text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_sku_not_blank check (length(btrim(sku)) > 0),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_name_not_blank check (length(btrim(name)) > 0),
  constraint products_category_not_blank check (length(btrim(category)) > 0)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text not null unique,
  alt_text text not null,
  sort_order integer not null default 0,
  is_thumbnail boolean not null default false,
  created_at timestamptz not null default now(),
  constraint product_images_url_not_blank check (length(btrim(image_url)) > 0),
  constraint product_images_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint product_images_alt_not_blank check (length(btrim(alt_text)) > 0)
);

create index if not exists products_public_catalog_idx
  on public.products (sort_order, created_at desc)
  where is_active = true;

create index if not exists products_category_idx
  on public.products (category)
  where is_active = true;

create index if not exists product_images_product_sort_idx
  on public.product_images (product_id, sort_order);

create unique index if not exists product_images_one_thumbnail_idx
  on public.product_images (product_id)
  where is_thumbnail = true;

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

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.product_images enable row level security;

revoke all on public.products from anon, authenticated;
revoke all on public.product_images from anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_images to authenticated;

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

drop policy if exists "Public can read images for active products" on public.product_images;
create policy "Public can read images for active products"
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and (products.is_active = true or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  )
);

drop policy if exists "Admins can insert product images" on public.product_images;
create policy "Admins can insert product images"
on public.product_images for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update product images" on public.product_images;
create policy "Admins can update product images"
on public.product_images for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete product images" on public.product_images;
create policy "Admins can delete product images"
on public.product_images for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can update product image files" on storage.objects;
create policy "Admins can update product image files"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete product image files" on storage.objects;
create policy "Admins can delete product image files"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
