begin;

alter table public.products
  add constraint products_colors_not_empty
  check (cardinality(colors) >= 1) not valid;

alter table public.products
  add constraint products_occasions_not_empty
  check (cardinality(occasions) >= 1) not valid;

comment on constraint products_colors_not_empty on public.products is
  'New and updated products must provide at least one orderable color.';

comment on constraint products_occasions_not_empty on public.products is
  'New and updated products must provide at least one orderable occasion.';

commit;
