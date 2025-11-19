# Project Hub - Photography Project Management

A specialized project management application built specifically for photographers to manage all aspects of their photoshoots, from planning to financial tracking.

## Overview

Project Hub is a comprehensive photography project management tool that helps photographers organize their work across multiple projects. It provides features for task management, budget tracking, contact management, and calendar scheduling - all in one unified platform.

## Project Structure

### Frontend (`client/`)
- **React + TypeScript** - Modern SPA with Wouter for routing
- **Tailwind CSS + Shadcn UI** - Professional, clean design system
- **TanStack Query** - Data fetching and caching
- **React Hook Form + Zod** - Form validation and management
- **Recharts** - Budget visualization charts
- **Date-fns** - Date formatting and manipulation

### Backend (`server/`)
- **Express.js** - RESTful API server
- **In-memory storage** - Fast, efficient data persistence for MVP
- **Zod validation** - Request validation
- **TypeScript** - End-to-end type safety

### Shared (`shared/`)
- **Drizzle schemas** - Type-safe data models
- **Zod schemas** - Validation schemas
- **Project templates** - Pre-configured task lists for different shoot types

## Core Features

### 1. Project Management
- Create projects from templates (Wedding, Portrait, Commercial, Event) or start from scratch
- Track project status: Planning, In Progress, Editing, Delivered
- Store client information, shoot dates, and budgets
- Project dashboard with key metrics and upcoming deadlines

### 2. Task Management
- Organize tasks by sections: Pre-Production, Shoot Day, Post-Production, General
- Assign tasks to team members
- Set due dates and track progress (To Do, In Progress, Completed)
- Template-based task lists that auto-populate based on project type
- Collapsible sections for better organization

### 3. Budget Tracking
- Track planned vs actual expenses
- Categorize expenses (Studio Rental, Assistant Fee, Transportation, etc.)
- Monitor payment status (Paid/Unpaid)
- Automatic profit/loss calculations
- Visual budget comparison charts
- Real-time budget snapshots in project dashboard

### 4. Contact Management
- Store key contacts per project (Client, Assistant, Makeup Artist, Venue Coordinator, etc.)
- Quick access to email and phone information
- Add notes for each contact
- Avatar-based contact cards with initials

### 5. Integrated Calendar
- Unified calendar view aggregating all time-sensitive data
- Multiple view modes: Month, Week, Day
- Automatic display of:
  - Scheduled photoshoots from project details
  - Meetings and consultations
  - Task deadlines
- Color-coded event types
- Event details with location and descriptions

## Technical Architecture

### Data Models

**Project**
- Basic info: name, type, status, description
- Client details: clientName
- Scheduling: shootDate
- Financial: budget
- Metadata: id, createdAt

**Task**
- Organization: projectId, section
- Details: title, status, assignee, dueDate
- Metadata: id, createdAt

**Contact**
- Organization: projectId
- Details: name, role, email, phone, notes
- Metadata: id

**BudgetItem**
- Organization: projectId
- Financial: plannedCost, actualCost, paymentStatus
- Details: description, category
- Metadata: id

**CalendarEvent**
- Organization: projectId
- Details: title, type, description, location
- Timing: startDate, endDate
- Metadata: id

### API Endpoints

**Projects**
- GET `/api/projects` - List all projects
- GET `/api/projects/:id` - Get project details
- POST `/api/projects` - Create new project (with template tasks)
- PATCH `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project (cascades to all related data)

**Tasks**
- GET `/api/tasks` - List all tasks
- GET `/api/projects/:id/tasks` - Get project tasks
- POST `/api/tasks` - Create task
- PATCH `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

**Contacts**
- GET `/api/contacts` - List all contacts
- GET `/api/projects/:id/contacts` - Get project contacts
- POST `/api/contacts` - Create contact
- PATCH `/api/contacts/:id` - Update contact
- DELETE `/api/contacts/:id` - Delete contact

**Budget Items**
- GET `/api/budget-items` - List all budget items
- GET `/api/projects/:id/budget` - Get project budget items
- POST `/api/budget-items` - Create budget item
- PATCH `/api/budget-items/:id` - Update budget item
- DELETE `/api/budget-items/:id` - Delete budget item

**Calendar Events**
- GET `/api/calendar-events` - List all calendar events
- GET `/api/projects/:id/events` - Get project events
- POST `/api/calendar-events` - Create event
- PATCH `/api/calendar-events/:id` - Update event
- DELETE `/api/calendar-events/:id` - Delete event

### Design System

**Color Scheme**
- Primary: Professional Blue (215, 100%, 50%)
- Success: Green (142, 71%, 45%)
- Warning: Amber (38, 92%, 50%)
- Destructive: Red (0, 72%, 51%)

**Typography**
- Primary Font: Inter
- Monospace: JetBrains Mono (for numbers, dates, budgets)

**Component Library**
- Built on Shadcn UI primitives
- Custom Sidebar navigation
- Cards for content organization
- Badges for status indicators
- Forms with validation
- Dialogs for CRUD operations
- Charts for budget visualization

### State Management
- TanStack Query for server state
- React Hook Form for form state
- localStorage for theme preference
- URL-based routing with Wouter

## User Workflows

### Creating a New Project
1. Click "New Project" from sidebar or projects page
2. Select project type template or blank
3. Fill in project details (name, client, date, budget)
4. Project is created with pre-populated tasks (if using template)
5. Navigate to project detail page

### Managing Tasks
1. View tasks organized by section
2. Add new tasks with assignees and due dates
3. Update task status (checkbox or dropdown)
4. Tasks auto-sync with calendar for deadlines

### Tracking Budget
1. Add budget items with planned and actual costs
2. Track payment status
3. View real-time profit/loss calculations
4. Visual charts compare budget vs expenses

### Calendar Integration
1. All deadlines and events appear automatically
2. Switch between month/week/day views
3. Click events to navigate to related projects
4. Color coding for easy identification

## Development

### Running the Application
```bash
npm run dev
```

This starts both the Express backend and Vite frontend on the same port.

### Project Templates
The application includes pre-configured templates for:
- **Wedding**: 13 tasks covering pre-production, ceremony, reception, and delivery
- **Portrait**: 10 tasks for portrait sessions
- **Commercial**: 11 tasks for commercial/product shoots
- **Event**: 11 tasks for event photography
- **Blank**: Empty project for custom workflows

### Data Persistence
Currently using in-memory storage for rapid prototyping. Data resets on server restart. Future enhancement: PostgreSQL database for persistent storage.

## Recent Changes (October 2025)

### Latest Updates
- Implemented complete schema with 5 data models
- Built comprehensive React frontend with all pages and components
- Created RESTful API with full CRUD operations
- Added project templates with auto-populated tasks
- Integrated budget tracking with visual charts
- Implemented multi-view calendar system
- Added theme toggle (light/dark mode)
- Professional sidebar navigation
- Responsive design across all breakpoints

### Design Philosophy
- Clean, professional aesthetic for creative professionals
- Information-dense layouts without overwhelming users
- Consistent spacing and visual hierarchy
- Subtle interactions with hover states
- Color-coded status indicators for quick scanning
- Monospace fonts for financial data
- Avatar system for contacts

## Future Enhancements

### Next Phase Features
- PostgreSQL database for persistent storage
- Notification system for deadline reminders
- File upload for contracts and shot lists
- Calendar export/sync (Google Calendar, Outlook)
- Detailed financial reporting
- Expense categorization and trends
- Multi-user support with team collaboration
- Project templates customization
- Email/SMS notifications
- Invoice generation
- Time tracking integration
