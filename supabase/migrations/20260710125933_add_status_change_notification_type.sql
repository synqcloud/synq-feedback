-- New enum value in its own migration/transaction: Postgres won't let a
-- newly added enum value be referenced in the same transaction it was
-- added in, so the trigger functions that use it live in the next migration.
alter type public.notification_type add value 'status_change';
