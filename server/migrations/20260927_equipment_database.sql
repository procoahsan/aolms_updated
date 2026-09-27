BEGIN;
CREATE TABLE IF NOT EXISTS equipment_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 kind text NOT NULL CHECK(kind IN ('ont','cpe')),
 category text NOT NULL,
 data jsonb NOT NULL DEFAULT '{}',
 source_file text,
 source_sheet text,
 source_row integer,
 source_year text,
 original_data jsonb,
 version integer NOT NULL DEFAULT 1,
 updated_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(kind,source_file,source_sheet,source_row)
);
CREATE INDEX IF NOT EXISTS equipment_category_idx ON equipment_records(kind,category,source_year);
CREATE TABLE IF NOT EXISTS equipment_changes (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 record_id uuid NOT NULL REFERENCES equipment_records(id),
 actor_id uuid NOT NULL,
 before_data jsonb,
 after_data jsonb NOT NULL,
 changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE equipment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_changes ENABLE ROW LEVEL SECURITY;
COMMIT;
