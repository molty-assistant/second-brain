import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use a persistent location for the database
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'mission-control.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'next',
    assignee TEXT DEFAULT 'molty',
    notes TEXT,
    content TEXT,
    created TEXT DEFAULT (datetime('now')),
    completed TEXT,
    updated TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'post',
    status TEXT DEFAULT 'idea',
    platform TEXT,
    body TEXT,
    notes TEXT,
    created TEXT DEFAULT (datetime('now')),
    updated TEXT DEFAULT (datetime('now'))
  );
`);

export default db;

// Task helpers
export function getAllTasks() {
  return db.prepare('SELECT * FROM tasks ORDER BY created DESC').all();
}

export function getTask(id: string) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
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
  const id = task.id || crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, status, priority, assignee, notes, content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    task.title,
    task.status || 'todo',
    task.priority || 'next',
    task.assignee || 'molty',
    task.notes || null,
    task.content || null
  );
  return getTask(id);
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
  const fields = Object.keys(updates).filter(k => updates[k as keyof typeof updates] !== undefined);
  if (fields.length === 0) return getTask(id);
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => updates[f as keyof typeof updates]);
  
  db.prepare(`UPDATE tasks SET ${setClause}, updated = datetime('now') WHERE id = ?`).run(...values, id);
  return getTask(id);
}

export function deleteTask(id: string) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

// Content helpers
export function getAllContent() {
  return db.prepare('SELECT * FROM content ORDER BY created DESC').all();
}

export function getContent(id: string) {
  return db.prepare('SELECT * FROM content WHERE id = ?').get(id);
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
  const id = item.id || crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO content (id, title, type, status, platform, body, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    item.title,
    item.type || 'post',
    item.status || 'idea',
    item.platform || null,
    item.body || null,
    item.notes || null
  );
  return getContent(id);
}

export function updateContent(id: string, updates: Partial<{
  title: string;
  type: string;
  status: string;
  platform: string;
  body: string;
  notes: string;
}>) {
  const fields = Object.keys(updates).filter(k => updates[k as keyof typeof updates] !== undefined);
  if (fields.length === 0) return getContent(id);
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => updates[f as keyof typeof updates]);
  
  db.prepare(`UPDATE content SET ${setClause}, updated = datetime('now') WHERE id = ?`).run(...values, id);
  return getContent(id);
}
