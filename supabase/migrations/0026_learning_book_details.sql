-- Lukestyle — richer book detail: description, key takeaways, a 1-5
-- rating, and page count, so a finished book has a proper detail view
-- instead of just a title and a progress bar.

alter table public.learning_reading_list
  add column description text,
  add column key_takeaways text,
  add column rating smallint check (rating between 1 and 5),
  add column pages integer;
