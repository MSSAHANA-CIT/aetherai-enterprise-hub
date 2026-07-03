# D3 — Aether Command Center

Phase D3 delivers the flagship enterprise dashboard for AetherAI Enterprise Hub. The dashboard is rebuilt as an intelligent AI workspace — not a collection of placeholder cards.

## Architecture

```
Dashboard.tsx
└── DashboardDataProvider          # Centralized API data layer
    ├── CommandCenterHeader         # Workspace greeting, search, actions
    ├── 12-column responsive grid
    │   ├── WorkspaceOverview       # Left column (3 cols)
    │   ├── MainAIWorkspace         # Center column (6 cols)
    │   └── EnterpriseLiveStatus    # Right column (3 cols)
    ├── WorkspaceInsights           # Analytics widgets (full width)
    ├── SmartQuickActions           # Action grid (8 cols)
    ├── PersonalProductivity        # Focus metrics (4 cols)
    ├── AIActivityTimeline          # Animated timeline
    ├── RecentWork                  # Continue where you left off
    ├── UpcomingMeetings            # Meeting cards (7 cols)
    ├── EmployeePresence            # Live presence (5 cols)
    ├── AIRecommendations           # Dynamic AI cards (7 cols)
    ├── SecurityCenter              # Security mini-dashboard (5 cols)
    ├── SystemStatus                # Infrastructure health
    ├── RecentTeamActivity          # Enterprise feed
    └── FloatingAICopilot           # Persistent AI button
```

### Data Flow

1. `DashboardDataProvider` fetches all dashboard data in parallel on mount.
2. Data refreshes every 120 seconds automatically.
3. Child widgets consume data via `useDashboardData()` — no duplicate API calls.
4. `LazySection` defers rendering of below-the-fold sections until they enter the viewport.

## Widgets

| Widget | Location | Data Source |
|--------|----------|-------------|
| Command Center Header | Top | `useAuth`, `useLiveClock` |
| Workspace Overview | Left column | tasks, documents, notifications, meetings, overview |
| Main AI Workspace | Center | summaries, aiUsage, navigation to `/ai` |
| Enterprise Live Status | Right | systemHealth, presence, overview, security |
| Workspace Insights | Full width | overview, productivity, aiUsage, tasks |
| Smart Quick Actions | Grid | Static routes + role-aware filtering |
| Personal Productivity | Sidebar card | productivity, tasks, aiUsage |
| AI Activity Timeline | Full width | overview.recent_activity, summaries, documents, tasks |
| Recent Work | Full width | documents, meetings, summaries, tasks |
| Upcoming Meetings | Left | meetings API |
| Employee Presence | Right | presence API |
| AI Recommendations | Left | Derived from tasks, docs, summaries, notifications |
| Security Center | Right | security analytics, auth context |
| System Status | Right | health + email + security endpoints |
| Recent Team Activity | Full width | overview.recent_activity, documents, tasks |
| Global Search | Overlay | users, documents, meetings, tasks, summaries |
| Floating AI Copilot | Fixed bottom-right | Navigation to `/ai` |

## Components

### Shared (`command-center/shared/`)

| Component | Purpose |
|-----------|---------|
| `DashboardCard` | Glass/gradient card with Framer Motion hover lift |
| `StatusIndicator` | Green/yellow/red operational status dot |
| `AnimatedCounter` | Count-up animation with reduced-motion support |
| `LazySection` | Intersection Observer lazy loading + skeleton |
| `SectionHeader` | Consistent section titles |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useDashboardData` | `hooks/useDashboardData.tsx` | Centralized dashboard API state |
| `useLiveClock` | `hooks/useLiveClock.ts` | Greeting, date, time (30s refresh) |

## Data Sources (APIs)

| Endpoint | Used By |
|----------|---------|
| `GET /api/analytics/overview` | Overview, insights, timeline, team activity |
| `GET /api/analytics/productivity` | Insights, personal productivity |
| `GET /api/analytics/ai-usage` | AI workspace, insights |
| `GET /api/analytics/security` | Security center, system health |
| `GET /api/tasks` | Overview, recent work, recommendations |
| `GET /api/documents` | Overview, recent work, recommendations |
| `GET /api/meetings` | Meetings, recent work |
| `GET /api/notifications` | Overview unread count |
| `GET /api/summaries` | AI workspace, timeline, recent work |
| `GET /api/presence` | Live status, employee presence |
| `GET /api/users` | Global search |
| `GET /api/health` | System status |
| `GET /api/health/email` | Google integration status |

## Animations

- **Library**: Framer Motion (design system presets from `design/animations.ts`)
- **Page enter**: `fade` variant on main container
- **Cards**: `fadeUp` with staggered delays
- **Lists**: `staggerContainer` / `staggerItem`
- **Hover**: Card lift (`y: -2`) disabled when `prefers-reduced-motion`
- **Counters**: `AnimatedCounter` respects reduced motion
- **Timeline**: Sequential slide-in per event
- **Search overlay**: `modal` / `modalBackdrop` variants
- **Floating copilot**: Scale + opacity expand/collapse

## Performance Optimizations

1. **Parallel fetching** — All APIs called via `Promise.allSettled` in one batch.
2. **Single data provider** — Eliminates N+1 widget-level fetches.
3. **Lazy sections** — Below-fold widgets load on scroll via Intersection Observer.
4. **Skeleton loaders** — Per-widget loading states prevent layout shift.
5. **120s polling** — Background refresh without aggressive re-fetching.
6. **Reduced motion** — Animations degrade gracefully for accessibility.

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (`< lg`) | Single column stack — header → overview → AI → status → sections |
| Tablet (`lg`) | 3-column grid collapses to stacked; insights 2-col |
| Desktop (`xl`) | Full 12-column grid; quick actions 5-col; productivity sidebar |

### Grid Columns

- Main panels: `col-span-12 lg:col-span-3/6/3`
- Insights: `grid-cols-2 md:grid-cols-4`
- Quick actions: `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`
- Meetings/Presence: `col-span-12 lg:col-span-7/5`

## Accessibility

- Semantic landmarks: `<main>`, `<section>`, `<header>`, `role="banner"`
- ARIA labels on all interactive widgets
- `aria-live="polite"` on animated counters
- `aria-expanded` on copilot and profile menu
- Keyboard: ⌘K / Ctrl+K opens search; Escape closes overlay
- Focus states via design system buttons and inputs
- `prefers-reduced-motion` honored via `useReducedMotion`
- Status indicators include `role="status"` and `aria-label`

## File Structure

```
frontend/src/
├── hooks/
│   ├── useDashboardData.tsx
│   └── useLiveClock.ts
├── pages/
│   └── Dashboard.tsx
└── components/dashboard/command-center/
    ├── CommandCenterHeader.tsx
    ├── WorkspaceOverview.tsx
    ├── MainAIWorkspace.tsx
    ├── EnterpriseLiveStatus.tsx
    ├── WorkspaceInsights.tsx
    ├── SmartQuickActions.tsx
    ├── PersonalProductivity.tsx
    ├── AIActivityTimeline.tsx
    ├── RecentWork.tsx
    ├── UpcomingMeetings.tsx
    ├── EmployeePresence.tsx
    ├── AIRecommendations.tsx
    ├── SecurityCenter.tsx
    ├── SystemStatus.tsx
    ├── DashboardGlobalSearch.tsx
    ├── FloatingAICopilot.tsx
    ├── RecentTeamActivity.tsx
    └── shared/
        ├── DashboardCard.tsx
        ├── StatusIndicator.tsx
        ├── AnimatedCounter.tsx
        ├── LazySection.tsx
        └── SectionHeader.tsx
```

## Testing Checklist

- [ ] Dashboard loads without console errors
- [ ] All header buttons navigate correctly (Search, AI, Create, Profile, Notifications)
- [ ] Workspace overview cards link to correct pages
- [ ] AI workspace prompts open `/ai` with initial prompt
- [ ] Live status indicators reflect backend health
- [ ] Global search returns results for employees, docs, tasks, meetings
- [ ] Floating copilot expands and sends commands to AI
- [ ] Lazy sections render when scrolled into view
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Reduced motion disables hover lift and counter animation
- [ ] TypeScript build passes (`npm run build`)

- WebSocket-driven live presence updates (currently polling-based)
- Real meeting schedule integration (currently shows uploaded recordings)
- Manager-only analytics deep-links with permission guards in widgets

### D3 Follow-up (completed)

- **Code splitting** — `React.lazy` on dashboard route + below-fold widgets; Vite `manualChunks`
- **AI chat history** — `localStorage` via `aiChatHistory.ts`; resume sessions from dashboard
- **Live presence** — `/ws/presence` + `useWorkspacePresence` merged into dashboard data
- **Meeting schedule** — `scheduled_at`, `room`, `participants` + `PATCH /api/meetings/{id}/schedule`
- **Department** — `users.department` with role-based defaults in presence API
