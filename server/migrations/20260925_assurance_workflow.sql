BEGIN;
ALTER TABLE public.assurance_tickets
  ADD COLUMN IF NOT EXISTS spreadsheet_fields jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_mutation_id uuid;
ALTER TABLE public.assurance_submissions
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_mutation_id uuid;
-- Keep a former technician's form when the ticket is reassigned.
ALTER TABLE public.assurance_submissions DROP CONSTRAINT IF EXISTS assurance_submissions_ticket_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS assurance_submission_ticket_technician
  ON public.assurance_submissions(ticket_id, technician_id);
CREATE INDEX IF NOT EXISTS assurance_technician_status ON public.assurance_tickets(technician_id, status);
-- Use the authenticated Nest API for these writes; browser REST writes must not
-- bypass assignment, concurrency or submission deadline checks.
ALTER TABLE public.assurance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assurance_submissions ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.assurance_tickets, public.assurance_submissions FROM anon, authenticated;
COMMIT;
