'use server';

import { saveTask, deleteTask, savePipelineItem, Task } from '@/lib/content';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const status = formData.get('status') as string || 'todo';
  const priority = formData.get('priority') as string || 'next';
  const assignee = formData.get('assignee') as 'tom' | 'molty' || 'tom';
  const notes = formData.get('notes') as string;
  
  if (!title) return { error: 'Title is required' };
  
  saveTask({ title, status, priority, assignee, notes } as Partial<Task> & { title: string; status: string });
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function updateTask(slug: string, updates: Partial<Task>) {
  // Try markdown-based tasks first (content/tasks/*.md)
  const { getTasks, saveTask } = await import('@/lib/content');
  const tasks = getTasks();
  const task = tasks.find(t => t.slug === slug);
  
  if (task) {
    const updatedTask = { ...task, ...updates };
    if (updates.status === 'done' && !updatedTask.completed) {
      updatedTask.completed = new Date().toISOString().split('T')[0];
    }
    saveTask(updatedTask as Partial<Task> & { title: string; status: string });
    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true };
  }
  
  // Fall back to JSON-based tasks (data/tasks.json via db.ts)
  const db = await import('@/lib/db');
  const dbTask = db.getTask(slug);
  if (dbTask) {
    const dbUpdates: Record<string, string> = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.assignee) dbUpdates.assignee = updates.assignee;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.content !== undefined) dbUpdates.content = updates.content ?? '';
    if (updates.status === 'done') dbUpdates.completed = new Date().toISOString();
    db.updateTask(slug, dbUpdates);
    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true };
  }

  return { error: 'Task not found' };
}

export async function updateTaskStatus(slug: string, newStatus: string) {
  return updateTask(slug, { status: newStatus as Task['status'] });
}

export async function removeTask(slug: string) {
  // Try markdown first
  const { getTasks } = await import('@/lib/content');
  const tasks = getTasks();
  const task = tasks.find(t => t.slug === slug);
  
  if (task) {
    deleteTask(slug);
  } else {
    // Fall back to JSON-based tasks
    const db = await import('@/lib/db');
    db.deleteTask(slug);
  }
  
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function createPipelineItem(formData: FormData) {
  const title = formData.get('title') as string;
  const type = (formData.get('type') as string || 'post') as 'post' | 'article' | 'talk';
  const status = (formData.get('status') as string || 'ideas') as 'ideas' | 'drafting' | 'review' | 'published';
  const notes = formData.get('notes') as string;
  
  if (!title) return { error: 'Title is required' };
  
  savePipelineItem({ title, type, status, notes });
  revalidatePath('/content');
  revalidatePath('/');
  return { success: true };
}

export async function updatePipelineStatus(slug: string, newStatus: string) {
  const { getPipelineItems, savePipelineItem } = await import('@/lib/content');
  const items = getPipelineItems();
  const item = items.find(i => i.slug === slug);
  
  if (!item) return { error: 'Item not found' };
  
  savePipelineItem({ ...item, status: newStatus as 'ideas' | 'drafting' | 'review' | 'published' });
  revalidatePath('/content');
  revalidatePath('/');
  return { success: true };
}
