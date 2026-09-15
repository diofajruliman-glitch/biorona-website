begin;

-- Public read tetap berasal dari bucket public. DELETE dibatasi ke admin dan
-- path katalog berbentuk {product_uuid}/{file}.
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  and name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[^/]+$'
);

commit;
