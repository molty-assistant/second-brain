import path from 'path';
import fs from 'fs';

// Use a persistent location for the database (JSON file)
const DATA_DIR = process.env.DATA_PATH || path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, '[]');
}
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, '[]');
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  notes: string | null;
  content: string | null;
  created: string;
  completed: string | null;
  updated: string;
}

interface ContentItem {
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

function readTasks(): Task[] {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeTasks(tasks: Task[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function readContent(): ContentItem[] {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeContent(content: ContentItem[]) {
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
  notes: string;
  content: string;
  completed: string;
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
