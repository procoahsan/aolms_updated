# Project Audit

Only Service Delivery is active in Audit. Project tabs follow the Admin-managed Projects order. Service Assurance, FTTR, and all other tabs are blank; the backend returns empty results for those projects. Operations Center remains unchanged.

The Assurance adapter reads the selected project's assurance_tickets and submitted/locked assurance_submissions. It reuses dataVerification, crossVerifyOntCheck, and buildFinalOutput from Operations Center. Ticket number is the order reference. Resolved/Closed tickets map to the completed (Delivered) state expected by those functions. All tickets appear in Data Verification; Cross Verification requires a completed ticket and submitted form; Final Output retains the existing New-type rule and charge rules.

Controllers enter WBS Type and WBS Connection Type in the Assurance project table, stored in spreadsheet_fields.wbs_type and spreadsheet_fields.wbs_connection_type. Technicians independently enter Order Type and Connection Type in the Assurance form. Missing answers stay unmatched. New ONT serial comes from the controller record, with the submitted serial as fallback. Draft forms do not count as filled.

Apply database/migrations/20260928_assurance_audit_fields.sql before deploying. No existing answers are overwritten. Customer-template export remains disabled until the template and column mapping are supplied. ONT DB is the inventory page; no separate Inventory page is used.

Project names were swapped by `database/migrations/20260928_swap_service_project_names.sql`. Service Delivery uses the existing `SERVICE_ASSURANCE` internal code; Service Assurance uses `SERVICE_DELIVERY`. IDs, project sequence, API paths, saved records and customer-provided service-type values remain stable. Apply this repeatable migration to other environments with `node scripts/maintenance/rename-service-projects.cjs`.
