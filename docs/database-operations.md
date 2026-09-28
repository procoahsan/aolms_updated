# Database-backed operations

Operations Center no longer loads Excel files at startup, opens reference workbooks or stores upload buffers in server memory. Each request reads PostgreSQL. Controller-selected dates are passed with requests, so controllers cannot change each other's selection.

| Data | Persistent source |
| --- | --- |
| Staff directory | `staff_members` (separate from login profiles) |
| Delivery orders | `orders` |
| Current delivery responses | `delivery_submissions` |
| Logistics tickets | `assurance_tickets` |
| Current assurance responses | `assurance_submissions` |
| Historical technician responses and material records | `operations_history` |
| Older ONT/CPE reference inventory | `ont_inventory`, `cpe_inventory` |
| Editable ONT DB/CPE DB records | `equipment_records` |

Editable ONT DB values take precedence over older inventory during verification. Original source rows, including supplementary sheets, are preserved as structured JSON in `operations_history`; these are data records, not workbook file blobs. Existing ticket numbers are not overwritten by the migration. Unknown historical technician names do not create accounts or fabricated submissions. Historical source responses remain distinct from authenticated technician submissions.

The eight workbooks under `database/import-backups` are one-time migration inputs and retained backups. The deployed app does not need them. Import utilities remain under `scripts/maintenance`. Optional browser-side Excel export of Final Output remains a download feature and is not a storage dependency.

## Migration

Use Python with openpyxl to run `scripts/maintenance/extract-operations.py database/import-backups <outside-repository-output.jsonl>`. This only reads the workbooks. Run `node scripts/maintenance/import-operations.cjs <output.jsonl>` to apply the additive migration and import the records. Imports use small atomic batches with source keys, so interrupted runs can be repeated without replacing existing data. Run only one importer at a time.

Run `npm run test:database` for read-only integration checks of project ordering, Service Delivery audit data, staff, delivery data and transaction rollback. Run `npm test` for business-rule coverage and `npm run test:browser` for interface checks. These suites do not assert historical import totals.

Staff and history tables have row-level security enabled with no client policies. Access goes through the authenticated backend: Staff requires Admin; Logistics and Delivery require Admin or Controller. The old workbook upload endpoints are removed. Projects and technician forms remain the entry points for new operational work.
