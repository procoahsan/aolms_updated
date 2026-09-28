-- Rename workflows without moving records, changing project IDs, order or API contracts.
-- Internal codes intentionally remain stable; repeat execution is safe.
BEGIN;
LOCK TABLE projects IN SHARE ROW EXCLUSIVE MODE;
-- Free both unique names before assigning their swapped values.
UPDATE projects SET name = '__service_name_swap_' || id::text
WHERE code IN ('SERVICE_ASSURANCE', 'SERVICE_DELIVERY')
  AND name IS DISTINCT FROM CASE code
    WHEN 'SERVICE_ASSURANCE' THEN 'Service Delivery'
    WHEN 'SERVICE_DELIVERY' THEN 'Service Assurance'
  END;
UPDATE projects
SET name = CASE code
  WHEN 'SERVICE_ASSURANCE' THEN 'Service Delivery'
  WHEN 'SERVICE_DELIVERY' THEN 'Service Assurance'
END
WHERE code IN ('SERVICE_ASSURANCE', 'SERVICE_DELIVERY')
  AND name IS DISTINCT FROM CASE code
    WHEN 'SERVICE_ASSURANCE' THEN 'Service Delivery'
    WHEN 'SERVICE_DELIVERY' THEN 'Service Assurance'
  END;
COMMIT;
