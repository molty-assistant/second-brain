import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

// Use a persistent location for the database (JSON file)
// In production (Railway), use /app/data (mounted volume)
// Locally, use ./data
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? '/app/data' 
  : path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

// Ensure data directory and files exist (lazy initialization)
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TASKS_FILE)) {
      fs.writeFileSync(TASKS_FILE, '[]');
    }
    if (!fs.existsSync(CONTENT_FILE)) {
      fs.writeFileSync(CONTENT_FILE, '[]');
    }
  } catch (err) {
    // Ignore errors during build time
    console.warn('Could not initialize data directory:', err);
  }
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  workOrderId: string | null;
  notes: string | null;
  content: string | null;
  created: string;
  completed: string | null;
  updated: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  platform: string | null;
  body: string | null;
  notes: string | null;
  created: string;
  updated: string;
}

function toIsoStringFromDateLike(date: unknown, fallback: Date): string {
  try {
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string' && date.trim()) {
      // Supports YYYY-MM-DD or ISO strings
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  } catch {
    // ignore
  }
  return fallback.toISOString();
}

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

function migrateMarkdownTasksToJson(existingTasks: Task[]): { tasks: Task[]; changed: boolean } {
  // Read legacy tasks from content/tasks/*.md and append into JSON if missing (by title)
  // Keeps markdown files, but makes JSON the single source of truth.
  try {
    const tasksDir = path.join(process.cwd(), 'content', 'tasks');
    if (!fs.existsSync(tasksDir)) return { tasks: existingTasks, changed: false };

    const byTitle = new Map(existingTasks.map(t => [normalizeTitle(t.title), t] as const));

    const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) return { tasks: existingTasks, changed: false };

    const now = new Date();
    let changed = false;

    for (const file of files) {
      const filePath = path.join(tasksDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(raw);
      const stat = fs.statSync(filePath);

      const title = String((data as Record<string, unknown>).title || file.replace(/\.md$/, '').replace(/-/g, ' '));
      const titleKey = normalizeTitle(title);
      if (byTitle.has(titleKey)) continue;

      // Migration: old status values → new
      let status = String((data as Record<string, unknown>).status || 'todo');
      if (status === 'now' || status === 'next' || status === 'later') status = 'todo';

      // Priority: use old status if it was priority-based, otherwise default
      let priority = String((data as Record<string, unknown>).priority || 'next');
      const oldStatus = (data as Record<string, unknown>).status;
      if (oldStatus === 'now' || oldStatus === 'next' || oldStatus === 'later') {
        priority = String(oldStatus);
      }

      const assignee = String((data as Record<string, unknown>).assignee || 'tom');
      const notesVal = (data as Record<string, unknown>).notes;
      const notes = notesVal == null ? null : String(notesVal);

      const created = toIsoStringFromDateLike((data as Record<string, unknown>).created, stat.mtime);
      const completedRaw = (data as Record<string, unknown>).completed;
      const completed = completedRaw ? toIsoStringFromDateLike(completedRaw, now) : null;

      const migrated: Task = {
        id: crypto.randomUUID(),
        title,
        status,
        priority,
        assignee,
        workOrderId: null,
        notes,
        content: content?.trim() ? content.trim() : null,
        created,
        completed,
        updated: now.toISOString(),
      };

      existingTasks.push(migrated);
      byTitle.set(titleKey, migrated);
      changed = true;
    }

    if (changed) {
      // Newest first, like createTask()
      existingTasks.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    }

    return { tasks: existingTasks, changed };
  } catch (err) {
    // Safe to ignore (build-time, missing FS permissions, etc.)
    console.warn('Task markdown→JSON migration skipped:', err);
    return { tasks: existingTasks, changed: false };
  }
}

function readTasks(): Task[] {
  try {
    ensureDataDir();
    const existing = (JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8')) as Partial<Task>[]).map((task) => ({
      ...task,
      workOrderId:
        typeof task.workOrderId === 'string' && task.workOrderId.trim()
          ? task.workOrderId.trim()
          : null,
    })) as Task[];
    const { tasks, changed } = migrateMarkdownTasksToJson(existing);
    if (changed) writeTasks(tasks);
    return tasks;
  } catch {
    return [];
  }
}

function writeTasks(tasks: Task[]) {
  ensureDataDir();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function readContent(): ContentItem[] {
  try {
    ensureDataDir();
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeContent(content: ContentItem[]) {
  ensureDataDir();
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));
}

// Task helpers
export function getAllTasks() {
  return readTasks();
}

export function getTask(id: string) {
  const tasks = readTasks();
  return tasks.find(t => t.id === id);
}

export function createTask(task: {
  id?: string;
  title: string;
  status?: string;
  priority?: string;
  assignee?: string;
  workOrderId?: string;
  notes?: string;
  content?: string;
}) {
  const tasks = readTasks();
  const now = new Date().toISOString();
  const newTask: Task = {
    id: task.id || crypto.randomUUID(),
    title: task.title,
    status: task.status || 'todo',
    priority: task.priority || 'next',
    assignee: task.assignee || 'molty',
    workOrderId: task.workOrderId || null,
    notes: task.notes || null,
    content: task.content || null,
    created: now,
    completed: null,
    updated: now,
  };
  tasks.unshift(newTask);
  writeTasks(tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<{
  title: string;
  status: string;
  priority: string;
  assignee: string;
  workOrderId: string | null;
  notes: string | null;
  content: string | null;
  completed: string | null;
}>) {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updated: new Date().toISOString(),
  };
  writeTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: string) {
  const tasks = readTasks();
  const filtered = tasks.filter(t => t.id !== id);
  writeTasks(filtered);
}

// Content helpers
export function getAllContent() {
  return readContent();
}

export function getContent(id: string) {
  const content = readContent();
  return content.find(c => c.id === id);
}

export function createContent(item: {
  id?: string;
  title: string;
  type?: string;
  status?: string;
  platform?: string;
  body?: string;
  notes?: string;
}) {
  const content = readContent();
  const now = new Date().toISOString();
  const newItem: ContentItem = {
    id: item.id || crypto.randomUUID(),
    title: item.title,
    type: item.type || 'post',
    status: item.status || 'idea',
    platform: item.platform || null,
    body: item.body || null,
    notes: item.notes || null,
    created: now,
    updated: now,
  };
  content.unshift(newItem);
  writeContent(content);
  return newItem;
}

export function updateContent(id: string, updates: Partial<{
  title: string;
  type: string;
  status: string;
  platform: string;
  body: string;
  notes: string;
}>) {
  const content = readContent();
  const index = content.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  content[index] = {
    ...content[index],
    ...updates,
    updated: new Date().toISOString(),
  };
  writeContent(content);
  return content[index];
}

// No default export needed
export default {};
