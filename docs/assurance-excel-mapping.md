# March 2026 assurance mapping

Source: March 2026 Assurance sheet.xlsx, March 2026 sheet. 37 populated headers (A:AK). No customer rows are imported. Options use the workbook validation/reference sheets plus observed categorical values, with whitespace normalized. Open is added to support the requested unassigned workflow.

The literal I1 header is `2`; inferred Building from its position between Road/Flat and address values. KPI has stored labels but no formula in the inspected sheet, so remains editable. SLA is (Close Date/Time - Creationdate/time), stored in days as in Excel and displayed as elapsed hours. Datetimes are entered in Bahrain time (UTC+03:00). Controller is the creating user; Team stores technician_id rather than free text. Technical columns entered by Controllers are source notes; Technician submissions retain their separate existing form fields.

| Excel | Header | Storage | Input |
|---|---|---|---|
| A | Date | work_date | date |
| B | Creationdate/time | creation_datetime | datetime-local |
| C | Team | technician_id | technician |
| D | Controller | controller_id | controller |
| E | Package | package | select |
| F | Exchange | exchange | select |
| G | Block | block | text |
| H | Road | road | text |
| I | Building (Excel header: 2) | building | text |
| J | Flat | flat | text |
| K | Fault Description from LO | fault_description_from_lo | text |
| L | Mobile | mobile | text |
| M | Description | customer_description | text |
| N | Service Type (List) | service_type | select |
| O | LO Name (List) | lo_name | select |
| P | Ticket No | ticket_number | text |
| Q | Case service reques number-Email | spreadsheet_fields.case_service_request | text |
| R | Assigned Date/Time | assigned_datetime | datetime-local |
| S | Close Date/Time | close_datetime | datetime-local |
| T | Reported date to maintenance | spreadsheet_fields.maintenance_reported_at | datetime-local |
| U | Resolution date by maintenance | spreadsheet_fields.maintenance_resolved_at | datetime-local |
| V | SLA From creation time | sla_from_creation | computed |
| W | KPI Status (Automated) | kpi_status | select |
| X | Reason (If Exceeded) | reason_if_exceeded | select |
| Y | Circuit | circuit | text |
| Z | Status | status | select |
| AA | Root Cause | spreadsheet_fields.root_cause | select |
| AB | Resolution (List) | spreadsheet_fields.resolution | select |
| AC | Resolution Description | spreadsheet_fields.resolution_description | text |
| AD | Non-Genuine Ticket | spreadsheet_fields.non_genuine_ticket | select |
| AE | Call_Time | spreadsheet_fields.call_time | text |
| AF | Faulty/damaged | spreadsheet_fields.faulty_damaged | select |
| AG | ONT | spreadsheet_fields.ont | text |
| AH | SN OLD ONT | spreadsheet_fields.old_ont_sn | text |
| AI | New SN No As Per NCE | spreadsheet_fields.new_ont_sn | text |
| AJ | ONT Protection Box | spreadsheet_fields.ont_protection_box | text |
| AK | SAAS Type | spreadsheet_fields.saas_type | select |
