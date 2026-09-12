begin;

do $$
begin
  if not exists (
    select 1 from public.categories group by lower(btrim(name)) having count(*) > 1
  ) then
    create unique index if not exists categories_name_unique_ci
      on public.categories (lower(btrim(name)));
  end if;
end $$;

create or replace function public.sync_product_legacy_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select name into new.category
  from public.categories
  where id = new.category_id;

  if new.category is null then
    raise exception 'Kategori produk tidak valid atau sudah tidak tersedia.';
  end if;

  return new;
end;
$$;

-- TODO: hapus products.category pada migration berikutnya setelah semua consumer lama dipensiunkan.
drop trigger if exists products_sync_legacy_category on public.products;
create trigger products_sync_legacy_category
before insert or update of category_id on public.products
for each row execute function public.sync_product_legacy_category();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

commit;
