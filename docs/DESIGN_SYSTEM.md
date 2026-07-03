# Aether Design System

Enterprise UI foundation for **AetherAI Enterprise Hub**. This design system provides a consistent, premium, production-ready visual language inspired by OpenAI, Linear, Stripe Dashboard, Microsoft Teams, Atlassian, and Notion.

> **Phase D1 scope:** Foundation only. Existing pages are not migrated yet. Future phases will adopt these tokens and components.

---

## Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Professional** | Clean surfaces, restrained color, confident typography |
| **Enterprise** | Scalable patterns for dashboards, tables, and dense data |
| **Minimal** | No visual clutter; every element earns its place |
| **Premium** | Glass effects, subtle shadows, refined motion |
| **AI-first** | Domain colors and gradients for AI, knowledge, chat, tasks |
| **Consistent** | Single source of truth — no hardcoded values in components |

---

## Folder Structure

```
frontend/src/design/
├── colors.ts          # Color palette & gradients
├── typography.ts      # Type scale & font tokens
├── spacing.ts         # 4px-based spacing scale
├── radius.ts          # Border radius tokens
├── shadows.ts         # Elevation & glow shadows
├── animations.ts      # Framer Motion presets
├── icons.ts           # Icon size tokens (Lucide React)
├── layout.ts          # Breakpoints, containers, grid
├── theme.ts           # Aggregated theme object
├── tokens.ts          # Unified token exports
├── designSystem.ts    # Main entry point (tokens + components)
└── components/        # Reusable UI components
    ├── Button.tsx
    ├── Input.tsx
    ├── Card.tsx
    ├── Modal.tsx
    ├── Table.tsx
    ├── Badge.tsx
    ├── Alert.tsx
    ├── Toast.tsx
    ├── Loading.tsx
    ├── EmptyState.tsx
    ├── ErrorState.tsx
    ├── PageHeader.tsx
    ├── Layout.tsx
    ├── Sidebar.tsx
    ├── Topbar.tsx
    ├── Glass.tsx
    ├── PageTransition.tsx
    ├── Icon.tsx
    └── Accessibility.tsx
```

---

## Color Palette

### Core

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#6366f1` | CTAs, active states, focus rings |
| `secondary` | `#64748b` | Secondary actions |
| `accent` | `#8b5cf6` | Highlights, AI features |
| Gradient | Indigo → Purple | Hero, premium buttons |

### Semantic

| Token | Usage |
|-------|-------|
| `success` | Confirmations, online status |
| `warning` | Caution, pending states |
| `danger` | Errors, destructive actions |
| `info` | Informational alerts |

### Surfaces

| Token | Usage |
|-------|-------|
| `background` | App shell background |
| `surface` | Panels, sidebars |
| `card` | Content cards |
| `glass` | Glassmorphism overlays |

### Domain Colors

| Domain | Color | Use case |
|--------|-------|----------|
| AI Purple | `#8b5cf6` | AI assistant, ML features |
| Security Orange | `#f97316` | Audit, security panels |
| Analytics Red | `#ef4444` | Analytics dashboards |
| Knowledge Pink | `#ec4899` | Knowledge base |
| Chat Blue | `#3b82f6` | Team chat |
| Task Green | `#22c55e` | Task management |
| Notification Amber | `#f59e0b` | Notifications |

### Tailwind Usage

All colors are available with the `ds-` prefix:

```tsx
<div className="bg-ds-surface text-ds-text-primary border-ds-border" />
<span className="text-ds-success bg-ds-success-muted" />
```

---

## Typography

| Variant | Size | Weight | Use |
|---------|------|--------|-----|
| Display XL | 3.5rem | Bold | Marketing hero |
| Display | 2.75rem | Bold | Landing headlines |
| Heading XL | 2rem | Semibold | Page titles |
| Heading | 1.5rem | Semibold | Section headers |
| Subheading | 1.125rem | Medium | Card titles |
| Body Large | 1rem | Regular | Lead paragraphs |
| Body | 0.875rem | Regular | Default text |
| Small | 0.8125rem | Regular | Secondary text |
| Caption | 0.75rem | Medium | Labels, metadata |
| Button | 0.875rem | Medium | Button labels |
| Label | 0.8125rem | Medium | Form labels |
| Mono | 0.8125rem | Regular | Code, OTP |

```tsx
import { typographyClasses } from "@/design/designSystem";

<h1 className={typographyClasses.headingXl}>Dashboard</h1>
```

---

## Spacing

4px base unit. Use tokens — never arbitrary values.

| Token | Value |
|-------|-------|
| `1` | 4px |
| `2` | 8px |
| `3` | 12px |
| `4` | 16px |
| `5` | 20px |
| `6` | 24px |
| `8` | 32px |
| `10` | 40px |
| `12` | 48px |
| `16` | 64px |
| `20` | 80px |
| `24` | 96px |

```tsx
import { spacing } from "@/design/designSystem";
// Use in inline styles or Tailwind: p-4, gap-6, etc.
```

---

## Border Radius

| Token | Value | Class |
|-------|-------|-------|
| Small | 6px | `rounded-md` |
| Medium | 12px | `rounded-lg` |
| Large | 16px | `rounded-xl` |
| XL | 20px | `rounded-2xl` |
| 2XL | 24px | `rounded-3xl` |
| Circular | 9999px | `rounded-full` |

---

## Shadows

| Token | Usage |
|-------|-------|
| `soft` | Default cards |
| `medium` | Elevated panels |
| `strong` | Prominent elements |
| `glass` | Glass cards with inset highlight |
| `hover` | Hover elevation |
| `floating` | Dropdowns, popovers |
| `modal` | Modal dialogs |
| `glow` / `glowSm` | Primary accent glow |

---

## Animations

Single library: **Framer Motion**. All presets live in `animations.ts`.

| Preset | Usage |
|--------|-------|
| `pageTransition` | Route changes |
| `fade` / `fadeUp` / `fadeDown` | Content reveal |
| `slideUp` / `slideDown` | Panels, lists |
| `scale` | Modals, cards |
| `buttonHover` / `buttonPress` | Interactive feedback |
| `modal` / `modalBackdrop` | Dialog open/close |
| `dropdown` | Menus |
| `sidebar` | Collapse/expand |
| `toast` | Notifications |
| `loadingPulse` | Skeleton loaders |
| `errorShake` | Form validation |
| `otpSuccess` | OTP verification |

```tsx
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "@/design/designSystem";

<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>{item.name}</motion.div>
  ))}
</motion.div>
```

Reduced motion is respected globally via CSS and `getReducedMotionVariants()`.

---

## Components

### Button

Variants: `primary` | `secondary` | `ghost` | `outline` | `danger` | `success` | `gradient`

```tsx
import { Button, IconButton } from "@/design/designSystem";

<Button variant="primary" loading={isSaving}>Save changes</Button>
<IconButton aria-label="Settings"><Settings /></IconButton>
```

### Input

Types: Text, Email, Password, OTP, Search, Textarea, Select, Date, File Upload

```tsx
import { TextInput, PasswordInput, OtpInput } from "@/design/designSystem";

<TextInput label="Full name" placeholder="Jane Doe" error={errors.name} />
<OtpInput length={6} value={otp} onChange={setOtp} />
```

### Card

Variants: Default, Glass, Statistic, Feature, Info, Empty, Hover, Floating

```tsx
import { StatisticCard, GlassCard, FeatureCard } from "@/design/designSystem";

<StatisticCard label="Active Users" value="1,284" trend="up" change="+12%" />
```

### Modal

Variants: Standard, Confirmation, Danger, Large, Drawer, Fullscreen

```tsx
import { Modal, ConfirmationModal } from "@/design/designSystem";

<ConfirmationModal
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete document?"
  onConfirm={handleDelete}
  variant="danger"
/>
```

### Table

Enterprise table with sticky header, hover rows, pagination, sorting placeholders.

```tsx
import { Table } from "@/design/designSystem";

<Table
  columns={[
    { key: "name", header: "Name", sortable: true },
    { key: "role", header: "Role", render: (row) => <Badge variant="admin">{row.role}</Badge> },
  ]}
  data={users}
  stickyHeader
  page={1}
  totalPages={5}
  onPageChange={setPage}
/>
```

### Badge

Variants: success, danger, info, ai, security, task, employee, manager, admin, online, offline

### Alert & Toast

```tsx
import { Alert, ToastProvider, useToast } from "@/design/designSystem";

// Wrap app root:
<ToastProvider>{children}</ToastProvider>

// In components:
const { show } = useToast();
show({ variant: "success", title: "Document saved" });
```

### Loading

Skeleton, Spinner, PageLoader, CardLoader, TableLoader, ChatLoader, AIThinkingLoader

### Empty & Error States

```tsx
import { EmptyState, ErrorState } from "@/design/designSystem";

<EmptyState
  title="No tasks yet"
  description="Create your first task to get started."
  action={<Button variant="primary">Create task</Button>}
/>

<ErrorState onRetry={refetch} message="Failed to load analytics." />
```

### Page Header

```tsx
import { PageHeader } from "@/design/designSystem";

<PageHeader
  title="Team Analytics"
  subtitle="Performance overview for Q2"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Analytics" }]}
  actions={<Button variant="primary">Export</Button>}
/>
```

### Layout

```tsx
import { Container, Section, Grid, ContentArea } from "@/design/designSystem";

<Container>
  <Section spacing="lg">
    <Grid cols={3} gap="md">{/* cards */}</Grid>
  </Section>
</Container>
```

### Sidebar & Topbar

```tsx
import { Sidebar, SidebarSection, SidebarItem, Topbar } from "@/design/designSystem";

<Sidebar collapsed={collapsed}>
  <SidebarSection title="Workspace">
    <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active />
  </SidebarSection>
</Sidebar>
```

### Glassmorphism

Single reusable style — no duplicate CSS.

```tsx
import { GlassSurface, glassStyles } from "@/design/designSystem";

<GlassSurface variant="medium">Content</GlassSurface>
<div className={glassStyles.card}>Card content</div>
```

CSS classes: `.ds-glass`, `.ds-glass-medium`, `.ds-glass-strong`, `.ds-gradient-border`

### Page Transitions

```tsx
import { PageTransition } from "@/design/designSystem";

<PageTransition mode="slide">
  <Outlet />
</PageTransition>
```

---

## Icons

**Library:** Lucide React (single icon library)

| Size | Pixels | Class |
|------|--------|-------|
| Small | 14px | `w-3.5 h-3.5` |
| Medium | 18px | `w-[18px]` |
| Large | 22px | `w-[22px]` |
| XL | 28px | `w-7 h-7` |

```tsx
import { Icon } from "@/design/designSystem";
import { Sparkles } from "lucide-react";

<Icon icon={Sparkles} size="md" label="AI feature" />
```

---

## Responsiveness

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 768px | Phones |
| Tablet | 768–1023px | Tablets |
| Laptop | 1024–1279px | Small laptops |
| Desktop | ≥ 1280px | Desktop monitors |

Layout components use responsive Tailwind classes (`sm:`, `lg:`) aligned with `layout.ts` breakpoints.

---

## Accessibility

- **Focus rings:** `focus-visible:ring-2 ring-ds-focus` on all interactive elements
- **ARIA:** Labels on icon buttons, `role="alert"` on errors, `aria-live` on toasts
- **Keyboard:** Modal escape to close, OTP digit navigation
- **Color contrast:** Text meets WCAG AA on dark surfaces
- **Reduced motion:** Global CSS + `getReducedMotionVariants()` helper
- **Screen readers:** `VisuallyHidden`, `sr-only` utility class

---

## How Future Pages Will Use This System

### Step 1 — Import from design system

```tsx
import {
  PageHeader,
  Button,
  Card,
  Table,
  Badge,
  colors,
  spacing,
} from "../design/designSystem";
```

### Step 2 — Replace hardcoded styles

```tsx
// Before (legacy)
<div className="bg-[#16161f] border border-white/10 p-6">

// After (design system)
<Card variant="glass" padding="md">
```

### Step 3 — Use layout primitives

```tsx
<Container>
  <PageHeader title="Users" actions={<Button>Add user</Button>} />
  <Section>
    <Table columns={columns} data={users} />
  </Section>
</Container>
```

### Step 4 — Wrap routes with transitions

```tsx
<PageTransition mode="fade">
  <Routes>...</Routes>
</PageTransition>
```

### Step 5 — Add toast provider at app root

```tsx
<ToastProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</ToastProvider>
```

---

## Quality Rules

1. **No hardcoded colors** — use `ds-*` Tailwind classes or `colors` tokens
2. **No duplicated styling** — use design system components
3. **No arbitrary spacing** — use the 4px scale
4. **One icon library** — Lucide React only
5. **One animation library** — Framer Motion only
6. **One glass style** — `.ds-glass` utilities

---

## Backward Compatibility

Existing pages continue using `src/components/ui/*` and `src/styles/theme.ts`. The design system coexists without breaking changes. Legacy Tailwind classes (`aether-*`, `surface-*`, `.glass`) remain functional and map to design system equivalents where applicable.
