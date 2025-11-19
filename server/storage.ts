import {
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Contact,
  type InsertContact,
  type BudgetItem,
  type InsertBudgetItem,
  type CalendarEvent,
  type InsertCalendarEvent,
  projectTemplates,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  getContactsByProject(projectId: string): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, data: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  getBudgetItems(): Promise<BudgetItem[]>;
  getBudgetItem(id: string): Promise<BudgetItem | undefined>;
  getBudgetItemsByProject(projectId: string): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: string, data: Partial<BudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: string): Promise<boolean>;

  getCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  getCalendarEventsByProject(projectId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private contacts: Map<string, Contact>;
  private budgetItems: Map<string, BudgetItem>;
  private calendarEvents: Map<string, CalendarEvent>;

  constructor() {
    this.projects = new Map();
    this.tasks = new Map();
    this.contacts = new Map();
    this.budgetItems = new Map();
    this.calendarEvents = new Map();
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);

    if (insertProject.type && insertProject.type !== "Blank") {
      const template = projectTemplates[insertProject.type as keyof typeof projectTemplates];
      if (template) {
        for (const taskTemplate of template) {
          await this.createTask({
            projectId: id,
            title: taskTemplate.title,
            section: taskTemplate.section,
            status: "To Do",
            assignee: "",
          });
        }
      }
    }

    return project;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated = { ...project, ...data };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = this.projects.delete(id);
    if (deleted) {
      const projectTasks = Array.from(this.tasks.values()).filter(t => t.projectId === id);
      projectTasks.forEach(t => this.tasks.delete(t.id));

      const projectContacts = Array.from(this.contacts.values()).filter(c => c.projectId === id);
      projectContacts.forEach(c => this.contacts.delete(c.id));

      const projectBudget = Array.from(this.budgetItems.values()).filter(b => b.projectId === id);
      projectBudget.forEach(b => this.budgetItems.delete(b.id));

      const projectEvents = Array.from(this.calendarEvents.values()).filter(e => e.projectId === id);
      projectEvents.forEach(e => this.calendarEvents.delete(e.id));
    }
    return deleted;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updated = { ...task, ...data };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactsByProject(projectId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(c => c.projectId === projectId);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;

    const updated = { ...contact, ...data };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async getBudgetItems(): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values());
  }

  async getBudgetItem(id: string): Promise<BudgetItem | undefined> {
    return this.budgetItems.get(id);
  }

  async getBudgetItemsByProject(projectId: string): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values()).filter(b => b.projectId === projectId);
  }

  async createBudgetItem(insertItem: InsertBudgetItem): Promise<BudgetItem> {
    const id = randomUUID();
    const item: BudgetItem = {
      ...insertItem,
      id,
    };
    this.budgetItems.set(id, item);
    return item;
  }

  async updateBudgetItem(id: string, data: Partial<BudgetItem>): Promise<BudgetItem | undefined> {
    const item = this.budgetItems.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...data };
    this.budgetItems.set(id, updated);
    return updated;
  }

  async deleteBudgetItem(id: string): Promise<boolean> {
    return this.budgetItems.delete(id);
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values());
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }

  async getCalendarEventsByProject(projectId: string): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values()).filter(e => e.projectId === projectId);
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = randomUUID();
    const event: CalendarEvent = {
      ...insertEvent,
      id,
    };
    this.calendarEvents.set(id, event);
    return event;
  }

  async updateCalendarEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const event = this.calendarEvents.get(id);
    if (!event) return undefined;

    const updated = { ...event, ...data };
    this.calendarEvents.set(id, updated);
    return updated;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }
}

export const storage = new MemStorage();
