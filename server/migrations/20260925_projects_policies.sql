BEGIN;

CREATE POLICY "admins can manage projects"
ON public.projects FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "active staff can view projects"
ON public.projects FOR SELECT TO authenticated
USING (public.get_my_role() IN ('admin', 'controller', 'technician'));

COMMIT;
