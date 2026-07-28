-- Lets a subscription represent a recurring transfer (e.g. into a savings
-- or investment account) instead of a pure outgoing bill. When set, the
-- cron/"pay now" flow posts a second, offsetting income transaction into
-- this account alongside the usual expense leg.
alter table finance_subscriptions
  add column destination_account_id uuid references finance_accounts(id) on delete set null;
