BEGIN;
CREATE TABLE IF NOT EXISTS operations_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 source_file text NOT NULL, source_sheet text NOT NULL, source_row integer NOT NULL,
 dataset text NOT NULL, reference text, work_date date,
 data jsonb NOT NULL, original_cells jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(source_file,source_sheet,source_row)
);
CREATE INDEX IF NOT EXISTS operations_history_reference_idx ON operations_history(dataset,reference,work_date);
ALTER TABLE operations_history ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS staff_members (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 data jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
 source_key text UNIQUE, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legacy_data jsonb NOT NULL DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS import_key text UNIQUE;
ALTER TABLE assurance_tickets ADD COLUMN IF NOT EXISTS legacy_data jsonb NOT NULL DEFAULT '{}';
ALTER TABLE ont_inventory ADD COLUMN IF NOT EXISTS import_key text UNIQUE;
ALTER TABLE cpe_inventory ADD COLUMN IF NOT EXISTS import_key text UNIQUE;
COMMIT;
