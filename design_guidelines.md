# Project Hub - Design Guidelines for Photographers

## Design Approach

**Selected Approach:** Design System with Creative Professional Focus
- **Primary Reference:** Linear's clean, sophisticated productivity aesthetic
- **Secondary Influences:** Notion's flexible organization, Asana's task clarity
- **Rationale:** Photographers need a professional tool that's visually refined without being distracting, with clear information hierarchy for complex project data

## Core Design Principles

1. **Professional Clarity:** Clean, uncluttered interfaces that put project data front and center
2. **Visual Refinement:** Subtle sophistication appropriate for creative professionals
3. **Information Density:** Efficient use of space to display multiple data points without overwhelming
4. **Contextual Hierarchy:** Clear visual distinction between different data types (tasks, budgets, dates)

## Color Palette

**Light Mode:**
- Background Primary: 0 0% 100% (pure white)
- Background Secondary: 220 13% 97% (subtle gray)
- Background Tertiary: 220 13% 95% (card backgrounds)
- Text Primary: 220 9% 15% (near black)
- Text Secondary: 220 9% 46% (muted text)
- Border: 220 13% 91% (subtle borders)
- Primary Brand: 215 100% 50% (professional blue)
- Success: 142 71% 45% (green for completed)
- Warning: 38 92% 50% (amber for deadlines)
- Danger: 0 72% 51% (red for overdue)

**Dark Mode:**
- Background Primary: 220 13% 8% (deep charcoal)
- Background Secondary: 220 13% 11% (raised surfaces)
- Background Tertiary: 220 13% 13% (cards)
- Text Primary: 220 9% 95% (near white)
- Text Secondary: 220 9% 65% (muted)
- Border: 220 13% 18% (subtle borders)
- Colors remain consistent with adjusted saturation

## Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) - clean, professional, excellent readability
- Monospace: 'JetBrains Mono' (for budget numbers, dates)

**Type Scale:**
- Headings: font-semibold
  - H1: text-3xl (project titles)
  - H2: text-2xl (section headers)
  - H3: text-xl (subsections)
- Body: text-base, font-normal
- Small: text-sm (metadata, labels)
- Tiny: text-xs (timestamps, helper text)
- Numbers/Data: font-medium (budget figures, counts)

## Layout System

**Spacing Units:** Use Tailwind primitives 2, 4, 6, 8, 12, 16, 24
- Component padding: p-6
- Section spacing: space-y-8 or gap-8
- Card padding: p-6
- Tight groupings: space-y-2
- Page margins: px-8 py-6

**Grid System:**
- Main dashboard: 12-column grid with flexible card placement
- Sidebar: Fixed 280px width
- Content area: flex-1 with max-w-7xl container

## Component Library

**Navigation:**
- Sidebar navigation with icon + label format
- Active state: subtle background highlight with left border accent
- Hover states: slight background color change

**Cards & Containers:**
- Rounded corners: rounded-lg
- Subtle shadows: shadow-sm for elevation
- Border: 1px solid border color
- Hover elevation: shadow-md transition

**Project Dashboard Cards:**
- Status Indicator: Pill-shaped badges with dot icon (Planning/In Progress/Editing/Delivered)
- Deadline Cards: Compact cards with calendar icon, date, and countdown
- Contact Cards: Avatar + name + role in horizontal layout
- Budget Snapshot: Large numbers with label, color-coded profit/loss

**Task Management:**
- Checkbox: Custom styled with smooth animation
- Task rows: Hover background with quick actions reveal
- Progress states: Color-coded borders (gray/blue/green)
- Section headers: Collapsible with count badges
- Assignment: Avatar chips with subtle background

**Budget Tracker:**
- Table layout with alternating row backgrounds
- Planned vs Actual: Side-by-side columns with comparison
- Status indicators: Small colored dots (green=paid, amber=pending)
- Charts: Clean bar charts using muted colors with data labels
- Total rows: Emphasized with bolder weight and subtle background

**Calendar:**
- Month view: Grid with subtle borders
- Event pills: Color-coded by type (photoshoot/meeting/deadline)
- Multi-day events: Spanning pills with gradient fade
- Today highlight: Distinct border and background
- Time slots: Clean lines with hour markers

**Forms & Inputs:**
- Input fields: Border style with focus ring in primary color
- Labels: text-sm font-medium above inputs
- Select dropdowns: Custom styled with chevron icon
- Date pickers: Inline calendar overlay
- Dark mode: Consistent background colors for all inputs

**Buttons:**
- Primary: Solid primary color with white text
- Secondary: Border style with primary text
- Ghost: Text only with hover background
- Sizes: sm (py-1.5 px-3), md (py-2 px-4), lg (py-3 px-6)
- Icons: Leading or trailing with proper spacing

**Data Visualization:**
- Bar charts: Rounded bars with subtle shadows
- Progress bars: Rounded-full with smooth fill animation
- Comparison charts: Paired bars with contrasting colors
- Labels: Clear, positioned above or inline

**Modals & Overlays:**
- Backdrop: Dark overlay with blur effect
- Modal: Centered card with shadow-xl
- Close button: Top-right with clear × icon
- Actions: Bottom-right aligned button group

## Animations

**Minimal, Purposeful Motion:**
- Hover transitions: transition-colors duration-200
- Modal entry: Fade + subtle scale (0.95 to 1)
- Task completion: Checkbox checkmark animation only
- Loading states: Subtle skeleton screens
- NO scroll animations, parallax, or decorative motion

## Images

**Project Thumbnails:**
- Location: Project dashboard cards, project list
- Style: 16:9 aspect ratio, subtle rounded corners
- Treatment: Slight grayscale filter when project inactive

**Contact Avatars:**
- Location: Contact cards, task assignments
- Style: Circular, 32px or 40px diameter
- Fallback: Initials on gradient background

**Empty States:**
- Location: New projects, empty task lists, no budget entries
- Style: Simple illustration + helpful text
- Description: Minimalist line art in muted primary color

**NO large hero images** - This is a utility application, not a marketing site

## Additional Specifications

- Consistent 8px base spacing rhythm
- Focus states: 2px ring in primary color with offset
- Disabled states: 50% opacity
- Error states: Red border with error icon and message
- Success feedback: Green checkmark with brief toast notification
- Loading indicators: Spinner in primary color, size-appropriate to context
- Tooltips: Dark background, white text, appear on hover with delay
- Breadcrumbs: Subtle with chevron separators for deep navigation