# AOLMS UI Redesign Audit

## Current Frontend Overview

### Tech Stack
- **Framework**: React 19 + Vite 8 + TypeScript
- **Routing**: React Router 7
- **State Management**: TanStack Query (React Query) for server state, React useState for local state
- **Styling**: Tailwind CSS (via CSS variables in theme-context) + clsx + tailwind-merge
- **Icons**: Lucide React + inline SVG emoji placeholders
- **Auth**: Supabase Auth (client-side)

### Project Structure
```
client/src/
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point, Supabase client, QueryClient
├── index.css               # Base styles (conflicts with theme system)
├── app/
│   └── theme/
│       └── theme-context.tsx  # Light/dark theme provider
├── auth/
│   ├── components/ProtectedRoute.tsx
│   └── pages/Login.tsx
├── components/
│   ├── layout/
│   │   ├── Layout.tsx      # Main shell (sidebar + header + content)
│   │   ├── Sidebar.tsx     # Collapsible sidebar with navigation
│   │   └── Header.tsx      # Top bar with theme toggle
│   ├── Button.tsx          # Multi-variant button component
│   ├── Input.tsx           # Text input with label/error
│   ├── Select.tsx          # Select dropdown with label/error
│   ├── Textarea.tsx        # Textarea with label/error
│   ├── Modal.tsx           # Dialog modal with footer
│   ├── Card.tsx            # Card container with title/subtitle
│   └── Table.tsx           # Complex table with sorting, selection, inline editing
├── features/
│   ├── admin/
│   │   ├── layout/AdminLayout.tsx
│   │   └── pages/
│   │       ├── Dashboard.tsx
│   │       └── Profiles.tsx
│   ├── controller/
│   │   ├── layout/ControllerLayout.tsx
│   │   └── components/Spreadsheet.tsx
│   └── technician/
│       ├── layout/TechnicianLayout.tsx
│       └── components/DeliveryForm.tsx
└── lib/utils.ts            # cn() utility
```

## Current Pages & Routes

| Route | Role | Component | Status |
|-------|------|-----------|--------|
| `/login` | Public | `Login` | Functional |
| `/admin/dashboard` | Admin | Placeholder | Placeholder |
| `/admin/profiles` | Admin | `Profiles` | Functional |
| `/admin/projects` | Admin | Placeholder | Placeholder |
| `/controller/dashboard` | Controller | Placeholder | Placeholder |
| `/controller/orders` | Controller | `Spreadsheet` | Functional |
| `/controller/assurance-tickets` | Controller | Placeholder | Placeholder |
| `/technician/dashboard` | Technician | Placeholder | Placeholder |
| `/technician/todo` | Technician | Placeholder | Placeholder |
| `/technician/history` | Technician | Placeholder | Placeholder |
| `/technician/delivery-form/:orderId` | Technician | `DeliveryForm` | Functional |
| `/technician/assurance-form/:ticketId` | Technician | Placeholder | Placeholder |

## UI Problems Identified

### 1. Design System Issues
- **No centralized design tokens** - Colors, spacing, typography scattered across components
- **Inline CSS variables** in theme-context rather than CSS custom properties system
- **Inconsistent border radius**: `rounded-md`, `rounded-lg`, `rounded-full`, `rounded` used arbitrarily
- **Inconsistent shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` without system
- **Inconsistent spacing**: Arbitrary `p-4`, `p-6`, `px-4`, `px-6`, `gap-4`, `gap-6`
- **No typographic scale** - Font sizes used directly (`text-xl`, `text-3xl`, `text-sm`, `text-xs`)
- **Mixed icon styles**: Lucide React + emoji placeholders (`📊`, `👥`, `🗂️`)

### 2. Component Issues
- **Button**: 5 variants but inconsistent sizing (`h-8`, `h-10`, `h-12`); missing `active:scale-[0.98]` only on primary
- **Input/Select/Textarea**: Similar base styles but duplicated; no consistent height system
- **Modal**: Fixed size classes; backdrop blur missing; no mobile bottom-sheet behavior
- **Card**: Single style; no elevation variants; hover shadow change may be unexpected
- **Table**: Hardcoded gray colors (`gray-200`, `gray-500`) instead of CSS variables; no responsive strategy; checkbox column always present

### 3. Layout & Shell Issues
- **Layout.tsx**: Hardcoded Admin nav items (ignores props); placeholder icons defined in file
- **Sidebar**: No role-based nav items passed properly; mobile drawer behavior incomplete
- **Header**: Static "Dashboard" title; no breadcrumbs; user menu incomplete
- **No consistent content container** - Padding varies (`p-6`, `p-4`, `max-w-4xl`, `max-w-8xl`)

### 4. Theme System Issues
- **index.css conflicts** with theme-context CSS variables
- **Dark theme is simple inversion** - Not carefully tuned (e.g., shadows use white with opacity)
- **No system for semantic colors** (success, warning, error, info soft variants)
- **Flash of incorrect theme** possible on initial load (localStorage read after render)

### 5. Responsive Issues
- **Mobile-first not implemented** - Desktop-first with `md:` breakpoints
- **Sidebar**: Collapses on mobile but no proper drawer animation
- **Spreadsheet**: `overflow-x-auto` on mobile - horizontal scroll not ideal
- **DeliveryForm**: Grid works but touch targets may be small
- **Tables**: No card/list fallback for mobile

### 6. Accessibility Issues
- **Focus states**: Inconsistent (some use `focus:ring-2`, others don't)
- **Semantic HTML**: Modal uses `role="dialog"` but missing `aria-describedby`
- **Icon-only buttons**: Some lack `aria-label` (e.g., sidebar toggle)
- **Color contrast**: Not verified for all combinations
- **Keyboard navigation**: Table sorting works but cell editing unclear

### 6. Specific Page Issues

#### Login Page
- Theme toggle in wrong position (top-right of card)
- `useTheme()` called inline in onClick (creates new context subscription)
- No role validation UI yet (partially implemented)

#### Admin Dashboard
- 6 metric cards with progress bars (percentage calculation broken - uses 100/100)
- Raw HTML table instead of Table component
- No skeleton loading for activity table

#### Profiles Page
- Works but uses inline styles for actions column (JSX in data mapping)
- Modal form doesn't reset properly between create/edit
- No confirmation for delete (not implemented)

#### Controller Spreadsheet
- **Major issue**: Hardcoded `gray-*` Tailwind classes instead of CSS variables
- Inline editing works but no validation feedback
- Checkbox selection column always visible
- No frozen/sticky columns
- No virtualization for large datasets
- Modal shows ALL fields including system fields (id, created_at, updated_at)
- `requestSort` uses `keyof Order` but columns are dynamic

#### Technician DeliveryForm
- All fields in single grid - no logical grouping
- Controller-provided vs technician-entered not visually distinguished
- 30+ fields in flat list - overwhelming on mobile
- Boolean `actioned` rendered as select (should be radio/checkbox)
- No progressive disclosure
- Save/Submit buttons at bottom only (not sticky on mobile)

## Missing Pages/Components
- Technician: Dashboard, To-Do list, History, Assurance Form
- Controller: Dashboard, Assurance Tickets
- Admin: Projects, Settings, Audit Logs
- Shared: Toast notifications, Loading skeletons, Empty states, Error states, Badges, Tabs, Dropdowns, Drawers, Tooltips

## Styling Architecture Decision

### Current: Tailwind with CSS Variables
The theme-context defines CSS variables and applies them to `:root`. Components use `bg-[var(--color-primary)]` etc.

### Recommended: Keep Tailwind + Centralized Design Tokens
1. Define design tokens in a central file (colors, spacing, typography, radius, shadows, motion)
2. Use Tailwind's `theme.extend` in `tailwind.config.js` for design tokens
3. Keep CSS variables for runtime theme switching (light/dark)
4. Create base component library with consistent props/API

## Next Steps (Stage 2: Design System)

1. Create `src/design-system/tokens.ts` - Centralized design tokens
2. Create `tailwind.config.js` with design token integration
3. Refactor `theme-context.tsx` to use token system
4. Create base UI primitives: `Box`, `Text`, `Flex`, `Grid` (optional, or just consistent patterns)
5. Redesign core components: Button, Input, Select, Textarea, Modal, Card, Table
6. Create status/badge system
7. Create loading skeletons, empty states, error states
8. Fix index.css conflicts