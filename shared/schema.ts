import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project Schema
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // Wedding, Portrait, Commercial, Event, Blank
  status: text("status").notNull().default("Planning"), // Planning, In Progress, Editing, Delivered
  clientName: text("client_name"),
  shootDate: timestamp("shoot_date"),
  budget: integer("budget").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const updateProjectSchema = insertProjectSchema.partial();

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Task Schema
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  section: text("section").notNull().default("General"), // Pre-Production, Shoot Day, Post-Production, General
  status: text("status").notNull().default("To Do"), // To Do, In Progress, Completed
  assignee: text("assignee"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const updateTaskSchema = insertTaskSchema.partial().omit({
  projectId: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Contact Schema
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // Client, Assistant, Makeup Artist, Venue Coordinator, etc.
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

export const updateContactSchema = insertContactSchema.partial().omit({
  projectId: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type UpdateContact = z.infer<typeof updateContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Budget Item Schema
export const budgetItems = pgTable("budget_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  description: text("description").notNull(),
  plannedCost: integer("planned_cost").notNull().default(0),
  actualCost: integer("actual_cost").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("Unpaid"), // Paid, Unpaid
  category: text("category"), // Studio Rental, Assistant Fee, Transportation, Equipment Rental, etc.
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
});

export const updateBudgetItemSchema = insertBudgetItemSchema.partial().omit({
  projectId: true,
});

export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type UpdateBudgetItem = z.infer<typeof updateBudgetItemSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;

// Calendar Event Schema
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // Photoshoot, Meeting, Deadline
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  description: text("description"),
  location: text("location"),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
});

export const updateCalendarEventSchema = insertCalendarEventSchema.partial().omit({
  projectId: true,
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type UpdateCalendarEvent = z.infer<typeof updateCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Template definitions for different project types
export const projectTemplates = {
  Wedding: [
    { title: "Book venue", section: "Pre-Production" },
    { title: "Create shot list", section: "Pre-Production" },
    { title: "Send questionnaire to couple", section: "Pre-Production" },
    { title: "Scout location", section: "Pre-Production" },
    { title: "Confirm timeline with couple", section: "Pre-Production" },
    { title: "Charge batteries", section: "Shoot Day" },
    { title: "Pack equipment", section: "Shoot Day" },
    { title: "Conduct ceremony shots", section: "Shoot Day" },
    { title: "Capture reception moments", section: "Shoot Day" },
    { title: "Import and backup photos", section: "Post-Production" },
    { title: "Cull images", section: "Post-Production" },
    { title: "Edit selected photos", section: "Post-Production" },
    { title: "Deliver final gallery", section: "Post-Production" },
  ],
  Portrait: [
    { title: "Discuss vision with client", section: "Pre-Production" },
    { title: "Choose location or studio", section: "Pre-Production" },
    { title: "Plan wardrobe and props", section: "Pre-Production" },
    { title: "Book makeup artist (if needed)", section: "Pre-Production" },
    { title: "Set up lighting", section: "Shoot Day" },
    { title: "Conduct portrait session", section: "Shoot Day" },
    { title: "Review shots with client", section: "Shoot Day" },
    { title: "Import and backup photos", section: "Post-Production" },
    { title: "Retouch selected images", section: "Post-Production" },
    { title: "Deliver finals to client", section: "Post-Production" },
  ],
  Commercial: [
    { title: "Review creative brief", section: "Pre-Production" },
    { title: "Create shot list", section: "Pre-Production" },
    { title: "Secure permits if needed", section: "Pre-Production" },
    { title: "Hire crew/assistants", section: "Pre-Production" },
    { title: "Scout and prepare location", section: "Pre-Production" },
    { title: "Conduct product/brand shoot", section: "Shoot Day" },
    { title: "Review shots with client", section: "Shoot Day" },
    { title: "Import and organize files", section: "Post-Production" },
    { title: "Edit to brand guidelines", section: "Post-Production" },
    { title: "Submit for client approval", section: "Post-Production" },
    { title: "Deliver final assets", section: "Post-Production" },
  ],
  Event: [
    { title: "Discuss event details with client", section: "Pre-Production" },
    { title: "Create shot list", section: "Pre-Production" },
    { title: "Scout venue", section: "Pre-Production" },
    { title: "Plan equipment needs", section: "Pre-Production" },
    { title: "Arrive early for setup", section: "Shoot Day" },
    { title: "Capture key moments", section: "Shoot Day" },
    { title: "Photograph attendees", section: "Shoot Day" },
    { title: "Import and backup photos", section: "Post-Production" },
    { title: "Cull and organize images", section: "Post-Production" },
    { title: "Edit selected photos", section: "Post-Production" },
    { title: "Deliver event gallery", section: "Post-Production" },
  ],
  Blank: [],
};
