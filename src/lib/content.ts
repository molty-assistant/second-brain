import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

// === TASKS ===
export interface Task {
  slug: string;
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
  const tasksDir = path.join(contentDirectory, 'tasks');
  if (!fs.existsSync(tasksDir)) return [];
  
  const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const filePath = path.join(tasksDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const slug = file.replace(/\.md$/, '');
    
    let createdStr: string;
    if (data.created instanceof Date) {
      createdStr = data.created.toISOString().split('T')[0];
    } else {
      createdStr = data.created || fs.statSync(filePath).mtime.toISOString().split('T')[0];
    }

    let completedStr: string | undefined;
    if (data.completed instanceof Date) {
      completedStr = data.completed.toISOString().split('T')[0];
    } else if (data.completed) {
      completedStr = String(data.completed);
    }

    // Migration: old status values → new
    let status = data.status || 'todo';
    if (status === 'now' || status === 'next' || status === 'later') {
      status = 'todo';
    }
    
    // Priority: use old status if it was priority-based, otherwise default
    let priority = data.priority || 'next';
    if (data.status === 'now' || data.status === 'next' || data.status === 'later') {
      priority = data.status;
    }
    
    return {
      slug,
      title: data.title || slug,
      status: status as Task['status'],
      priority: priority as Task['priority'],
      assignee: data.assignee || 'tom',
      created: createdStr,
      completed: completedStr,
      notes: data.notes,
      content: content.trim(),
    };
  }).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return getTasks().filter(t => t.status === status);
}

export function saveTask(task: Partial<Task> & { title: string; status: string }): string {
  const tasksDir = path.join(contentDirectory, 'tasks');
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }
  
  const slug = task.slug || task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filePath = path.join(tasksDir, `${slug}.md`);
  
  const frontmatter: Record<string, unknown> = {
    title: task.title,
    status: task.status,
    priority: task.priority || 'next',
    assignee: task.assignee || 'tom',
    created: task.created || new Date().toISOString().split('T')[0],
  };

  if (task.notes) frontmatter.notes = task.notes;
  if (task.status === 'done') {
    frontmatter.completed = task.completed || new Date().toISOString().split('T')[0];
  }
  
  const content = matter.stringify(task.content || '', frontmatter);
  fs.writeFileSync(filePath, content);
  
  return slug;
}

export function deleteTask(slug: string): boolean {
  const filePath = path.join(contentDirectory, 'tasks', `${slug}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

// === PIPELINE (Content ideas/drafts) ===
export interface PipelineItem {
  slug: string;
  title: string;
  type: 'post' | 'article' | 'talk';
  /**
   * Content pipeline status.
   * Note: older files may contain `ideas` (plural) — we normalize to `idea`.
   */
  status: 'idea' | 'drafting' | 'review' | 'published';
  created: string;
  notes?: string;
  content?: string;
}

export function getPipelineItems(): PipelineItem[] {
  const pipelineDir = path.join(contentDirectory, 'pipeline');
  if (!fs.existsSync(pipelineDir)) return [];
  
  const files = fs.readdirSync(pipelineDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const filePath = path.join(pipelineDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const slug = file.replace(/\.md$/, '');
    
    let createdStr: string;
    if (data.created instanceof Date) {
      createdStr = data.created.toISOString().split('T')[0];
    } else {
      createdStr = data.created || fs.statSync(filePath).mtime.toISOString().split('T')[0];
    }
    
    const rawStatus = String(data.status || 'idea');
    const normalizedStatus = rawStatus === 'ideas' ? 'idea' : rawStatus;

    return {
      slug,
      title: data.title || slug,
      type: data.type || 'post',
      status: (normalizedStatus || 'idea') as PipelineItem['status'],
      created: createdStr,
      notes: data.notes,
      content: content.trim(),
    };
  }).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
}

export function savePipelineItem(item: Partial<PipelineItem> & { title: string; status: string; type: string }): string {
  const pipelineDir = path.join(contentDirectory, 'pipeline');
  if (!fs.existsSync(pipelineDir)) {
    fs.mkdirSync(pipelineDir, { recursive: true });
  }
  
  const slug = item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filePath = path.join(pipelineDir, `${slug}.md`);
  
  const frontmatter = {
    title: item.title,
    type: item.type,
    status: item.status,
    created: item.created || new Date().toISOString().split('T')[0],
    ...(item.notes && { notes: item.notes }),
  };
  
  const content = matter.stringify(item.content || '', frontmatter);
  fs.writeFileSync(filePath, content);
  
  return slug;
}

// === PROJECTS ===
export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  name: string;
  status: string;
  description: string;
  links: ProjectLink[];
  content?: string;
}

export function getProjects(): Project[] {
  const projectsDir = path.join(contentDirectory, 'projects');
  if (!fs.existsSync(projectsDir)) return [];
  
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const filePath = path.join(projectsDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const slug = file.replace(/\.md$/, '');
    
    return {
      slug,
      name: data.name || slug,
      status: data.status || 'unknown',
      description: data.description || '',
      links: data.links || [],
      content: content.trim(),
    };
  });
}

// === DECISIONS ===
export interface Decision {
  slug: string;
  title: string;
  date: string;
  status: 'proposed' | 'decided' | 'superseded';
  context: string;
  decision: string;
  consequences: string[];
  content?: string;
}

export function getDecisions(): Decision[] {
  const decisionsDir = path.join(contentDirectory, 'decisions');
  if (!fs.existsSync(decisionsDir)) return [];
  
  const files = fs.readdirSync(decisionsDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const filePath = path.join(decisionsDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const slug = file.replace(/\.md$/, '');
    
    let dateStr: string;
    if (data.date instanceof Date) {
      dateStr = data.date.toISOString().split('T')[0];
    } else {
      dateStr = data.date || fs.statSync(filePath).mtime.toISOString().split('T')[0];
    }
    
    return {
      slug,
      title: data.title || slug,
      date: dateStr,
      status: data.status || 'proposed',
      context: data.context || '',
      decision: data.decision || '',
      consequences: data.consequences || [],
      content: content.trim(),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getDecision(slug: string): Decision | null {
  const decisions = getDecisions();
  return decisions.find(d => d.slug === slug) || null;
}

// === RECENT ACTIVITY ===
export interface ActivityItem {
  type: 'task' | 'pipeline' | 'project' | 'decision' | 'document' | 'journal';
  title: string;
  date: string;
  slug: string;
  href: string;
}

export function getRecentActivity(limit: number = 5): ActivityItem[] {
  const items: ActivityItem[] = [];
  
  // Tasks
  getTasks().forEach(t => {
    items.push({
      type: 'task',
      title: t.title,
      date: t.created,
      slug: t.slug,
      href: '/tasks',
    });
  });
  
  // Pipeline
  getPipelineItems().forEach(p => {
    items.push({
      type: 'pipeline',
      title: p.title,
      date: p.created,
      slug: p.slug,
      href: '/content',
    });
  });
  
  // Decisions
  getDecisions().forEach(d => {
    items.push({
      type: 'decision',
      title: d.title,
      date: d.date,
      slug: d.slug,
      href: `/decisions/${d.slug}`,
    });
  });
  
  return items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
