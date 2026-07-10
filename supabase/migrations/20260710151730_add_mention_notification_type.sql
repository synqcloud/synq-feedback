-- New enum value must land in its own migration/transaction: Postgres
-- forbids using a freshly added enum value in the same transaction that
-- added it, so the trigger that references 'mention' lives in the next
-- migration file.
alter type public.notification_type add value if not exists 'mention';
