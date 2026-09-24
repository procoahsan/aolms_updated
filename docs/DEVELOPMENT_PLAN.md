# AOLMS Development Plan

## Stage 1: Repository Setup
- [x] Initialize project structure
- [x] Create `docs/DEVELOPMENT_PLAN.md`
- [x] Initialize `.gitignore`
- [x] Create `.env.example`

## Stage 2: Backend Foundation (NestJS)
- [ ] Initialize NestJS `server`
- [ ] Configure environment variables
- [ ] Setup TypeORM and database connection
- [ ] Implement Auth (Supabase JWT validation)
- [ ] Guards, Roles, Validation, Error Handling
- [ ] API Response wrapper
- [ ] Health endpoint

## Stage 3: Backend Entities
- [ ] Define TypeORM entities: `profiles`, `projects`, `orders`, `order_assignments`, `delivery_submissions`, `assurance_tickets`, `assurance_submissions`, `ont_inventory`, `cpe_inventory`, `cpe_replacements`, `attachments`, `audit_logs`

## Stage 4: Backend Modules & Logic
- [ ] Implement modules/services/controllers for all entities
- [ ] Implement business rules (assignment, lifecycle, 24-hour edit)

## Stage 5: Frontend Foundation
- [ ] Initialize Vite React `client`
- [ ] Setup Routing, Supabase Auth, TanStack Query
- [ ] Setup theme system (CSS variables)
- [ ] Responsive layout shell

## Stage 6: Implementation
- [ ] Admin interface
- [ ] Controller interface (Spreadsheet)
- [ ] Technician interface (Mobile forms)
- [ ] Local IndexedDB draft system
- [ ] Excel import/export
- [ ] Reporting

## Stage 7: Quality Assurance
- [ ] Tests (Unit, Component, E2E)
- [ ] Security hardening
- [ ] Linting/Type checking

## Stage 8: Production Readiness
- [ ] README.md update
- [ ] Deployment notes

## Legacy AOLMS integration

- The complete Excel-driven backend module set from `E:\AOLMS\backend\src\modules` is integrated at `server/src/legacy-aolms` and registered in `AppModule`.
- All eight Excel workbooks from `E:\AOLMS` are present in `server/data`; their SHA-256 hashes match the source files.
- The original dashboard frontend is integrated at `client/src/legacy-aolms` and available to authenticated admins at `/admin/legacy-operations`.
- Original operational inspection scripts are preserved at `server/scripts/legacy-aolms`.
- The active application remains `server` + `client`; duplicate build output, node modules, Git metadata, and `.env` secrets were not copied.
