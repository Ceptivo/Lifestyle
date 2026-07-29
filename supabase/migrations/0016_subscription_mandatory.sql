-- Lifestyle — mark subscriptions that can't be cut
--
-- Some recurring costs (tax, mandatory insurance) aren't discretionary —
-- the Forecast/Insights engines should never suggest reviewing or
-- cancelling them as a way to close a shortfall.

alter table public.finance_subscriptions
  add column is_mandatory boolean not null default false;

update public.finance_subscriptions
  set is_mandatory = true
  where name = 'SARS Tax';
