-- Lifestyle — allow Saturday and Sunday specials on restaurant_specials.

alter table public.restaurant_specials drop constraint if exists restaurant_specials_day_of_week_check;
alter table public.restaurant_specials add constraint restaurant_specials_day_of_week_check
  check (day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
