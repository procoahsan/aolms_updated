# Controller equipment databases

Controller navigation contains **ONT DB** (`/controller/ont-db`) and **CPE DB** (`/controller/cpe-db`). Both support search across record fields, category tabs, source-year filters, 50-row pagination, adding records and editing records. ONT categories follow the edited model. CPE entries remain in their selected project, including new Delivery Assurance entries.

The initial import reads only `Anisa overall sheet` in the ONT workbook: 3,308 records across four models. CPE contains 30,402 records. Sheets `2023`, `2024`, `2025` and `2026 Delivery Assurance` form one Delivery Assurance category (28,546 records). Other sheets retain their names, with surrounding whitespace removed. The headerless TBA sheet maps its two columns to serial and order number. FTTR has a different column layout and is mapped separately.

`equipment_records` stores stable UUIDs, normalized fields in `data`, source workbook/sheet/row/year and immutable `original_data`. Annual source years are preserved even when an installation date differs. Repeated serials are preserved as distinct historical rows. These records are independent of the older inventory tables, whose unique serial constraints cannot represent the full history. Future project lookups can reference an equipment record UUID.

The authenticated `/api/equipment/:kind` API permits Admin and Controller roles only. Row-level security blocks direct client access; all writes use the backend. Edits require the current version and create an `equipment_changes` audit entry in the same transaction. An outdated edit returns 409 without overwriting a newer change.

## Import and verification

1. Run `server/scripts/extract-equipment.py` with the ONT workbook path, CPE workbook path and an output JSON path outside the repository. It requires Python with openpyxl and does not modify the workbooks.
2. Run `node server/scripts/import-equipment.cjs <JSON path>` using backend database environment settings. It applies the additive migration and imports in one transaction. Re-running skips existing source workbook/sheet/row identities and preserves controller edits. This is an initial-source import, not a synchronization tool for subsequently reordered workbooks.
3. After building the backend, run `node server/scripts/verify-equipment.cjs <JSON path>` to check initial totals, filtering, updates, conflicts, audit records and access configuration. Verification rolls back its test writes. Initial-total assertions assume no later additions.

Source workbooks and extracted customer data are not committed to the repository.
