-- Lifestyle — "Things I Need": a categorized buy-list (Car, House, Personal,
-- Training, etc — category is free text so new ones can be added anytime).
-- Price is optional; items with a price can be moved into a Finance goal to
-- save toward, which deletes the wishlist row since it's now tracked there.

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric,
  icon text not null default 'shopping-bag',
  created_at timestamptz not null default now()
);

create index wishlist_items_category_idx on public.wishlist_items (category, created_at desc);

alter table public.wishlist_items enable row level security;
