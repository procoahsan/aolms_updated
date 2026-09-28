BEGIN;
ALTER TABLE delivery_submissions ADD COLUMN IF NOT EXISTS response_order_type text;
ALTER TABLE delivery_submissions ADD COLUMN IF NOT EXISTS response_connection_type text;
NOTIFY pgrst, 'reload schema';
COMMIT;
