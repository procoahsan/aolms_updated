BEGIN;
CREATE OR REPLACE FUNCTION public.preserve_delivery_submission_window()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.is_technician() THEN
    IF NEW.technician_id IS DISTINCT FROM auth.uid() OR NOT EXISTS (
      SELECT 1 FROM public.orders WHERE id = NEW.order_id
        AND technician_id = auth.uid() AND action = 'Delivered'
    ) THEN
      RAISE EXCEPTION 'This order is not assigned to you' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' THEN
      IF NEW.order_id IS DISTINCT FROM OLD.order_id OR NEW.technician_id IS DISTINCT FROM OLD.technician_id THEN
        RAISE EXCEPTION 'Submission ownership cannot be changed' USING ERRCODE = '42501';
      END IF;
      IF OLD.status = 'locked' OR (OLD.submitted_at IS NOT NULL AND clock_timestamp() >= OLD.submitted_at + interval '24 hours') THEN
        RAISE EXCEPTION 'The original 24-hour edit window has expired' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.submitted_at IS NOT NULL THEN
    NEW.submitted_at := OLD.submitted_at;
    IF NEW.status = 'draft' THEN NEW.status := 'submitted'; END IF;
  ELSIF NEW.status = 'submitted' THEN
    NEW.submitted_at := clock_timestamp();
  ELSE
    NEW.submitted_at := NULL;
  END IF;
  NEW.edit_deadline := NEW.submitted_at + interval '24 hours';
  NEW.last_saved_at := clock_timestamp();
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS preserve_delivery_submission_window ON public.delivery_submissions;
CREATE TRIGGER preserve_delivery_submission_window BEFORE INSERT OR UPDATE ON public.delivery_submissions
FOR EACH ROW EXECUTE FUNCTION public.preserve_delivery_submission_window();
COMMIT;
