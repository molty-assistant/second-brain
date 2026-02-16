import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllTasks } from '@/lib/db';

const contentDirectory = path.join(process.cwd(), 'content');

// Helper to ensure date is string
function ensureDateString(date: unknown, fallback: Date): string {
  if (date instanceof Date) return date.toISOString().split('T')[0];
  if (date) return String(date);
  return fallback.toISOString().split('T')[0];
}

// ============ TASKS ============
export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'now' | 'next' | 'later';
  assignee: 'tom' | 'molty';
  created: string;
  completed?: string;
  notes?: string;
  content?: string;
}

export function getTasks(): Task[] {
  const tasks = getAllTasks();
  return tasks
    .map(t => ({
      id: t.id,
      title: t.title,
      status: t.status as Task['status'],
      priority: t.priority as Task['priority'],
      assignee: t.assignee as Task['assignee'],
      created: t.created?.split('T')[0] || new Date().toISOString().split('T')[0],
      completed: t.completed?.split('T')[0] || undefined,
      notes: t.notes || undefined,
      content: t.content || undefined,
    }))
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return getTasks().filter(t => t.status === status);
}

// ============ CONTENT PIPELINE ============
export interface PipelineItem {
  slug: string;
  title: string;
  type: 'post' | 'article' | 'talk';
  status: 'idea' | 'drafting' | 'review' | 'published';
  created: string;
  notes?: string;
  content?: string;
}

export function getPipelineItems(): PipelineItem[] {
  const dir = path.join(contentDirectory, 'pipeline');
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const filePath = path.join(dir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      const stat = fs.statSync(filePath);
      
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title || file.replace(/\.md$/, '').replace(/-/g, ' '),
        type: data.type || 'post',
        status: data.status || 'idea',
        created: ensureDateString(data.created, stat.mtime),
        notes: data.notes,
        content: content.trim(),
      };
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
}

// ============ PROJECTS ============
export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  name: string;
  status: 'idea' | 'building' | 'mvp' | 'live' | 'paused';
  description: string;
  links: ProjectLink[];
  content?: string;
  htmlContent?: string;
}

export async function getProjects(): Promise<Project[]> {
  const dir = path.join(contentDirectory, 'projects');
  if (!fs.existsSync(dir)) return [];
  
  const projects: Project[] = [];
  
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const filePath = path.join(dir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(content);
    
    projects.push({
      slug: file.replace(/\.md$/, ''),
      name: data.name || file.replace(/\.md$/, '').replace(/-/g, ' '),
      status: data.status || 'idea',
      description: data.description || '',
      links: data.links || [],
      content: content.trim(),
      htmlContent: processedContent.toString(),
    });
  }
  
  return projects;
}

// ============ DECISIONS ============
export interface Decision {
  slug: string;
  title: string;
  date: string;
  status: 'proposed' | 'decided' | 'superseded';
  context?: string;
  decision?: string;
  consequences?: string;
  content?: string;
  htmlContent?: string;
}

export async function getDecisions(): Promise<Decision[]> {
  const dir = path.join(contentDirectory, 'decisions');
  if (!fs.existsSync(dir)) return [];
  
  const decisions: Decision[] = [];
  
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const filePath = path.join(dir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const stat = fs.statSync(filePath);
    
    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(content);
    
    decisions.push({
      slug: file.replace(/\.md$/, ''),
      title: data.title || file.replace(/\.md$/, '').replace(/-/g, ' '),
      date: ensureDateString(data.date, stat.mtime),
      status: data.status || 'proposed',
      context: data.context,
      decision: data.decision,
      consequences: data.consequences,
      content: content.trim(),
      htmlContent: processedContent.toString(),
    });
  }
  
  return decisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ============ DASHBOARD HELPERS ============
export function getRecentActivity(limit = 5) {
  const tasks = getTasks().map(t => ({ ...t, type: 'task' as const, date: t.created }));
  const pipeline = getPipelineItems().map(p => ({ ...p, type: 'content' as const, date: p.created }));
  
  return [...tasks, ...pipeline]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getStats() {
  const tasks = getTasks();
  const pipeline = getPipelineItems();
  
  const activeTasks = tasks.filter(t => t.status !== 'done');
  
  return {
    tasksTodo: tasks.filter(t => t.status === 'todo').length,
    tasksInProgress: tasks.filter(t => t.status === 'in-progress').length,
    tasksReview: tasks.filter(t => t.status === 'review').length,
    tasksDone: tasks.filter(t => t.status === 'done').length,
    // Priority-based counts for active tasks
    tasksNow: activeTasks.filter(t => t.priority === 'now').length,
    tasksNext: activeTasks.filter(t => t.priority === 'next').length,
    tasksLater: activeTasks.filter(t => t.priority === 'later').length,
    contentIdeas: pipeline.filter(p => p.status === 'idea').length,
    contentDrafting: pipeline.filter(p => p.status === 'drafting').length,
  };
}
