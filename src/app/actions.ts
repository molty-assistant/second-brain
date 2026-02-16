'use server';

import { revalidatePath } from 'next/cache';
import {
  createTask as createDbTask,
  updateTask as updateDbTask,
  deleteTask as deleteDbTask,
  Task,
} from '@/lib/db';

type TaskUpdates = Partial<Pick<Task, 'title' | 'status' | 'priority' | 'assignee' | 'notes' | 'content' | 'completed'>>;

export async function createTask(formData: FormData) {
  const title = (formData.get('title') as string) || '';
  const status = (formData.get('status') as string) || 'todo';
  const priority = (formData.get('priority') as string) || 'next';
  const assignee = ((formData.get('assignee') as string) || 'tom') as 'tom' | 'molty';
  const notes = (formData.get('notes') as string) || '';

  if (!title.trim()) return { error: 'Title is required' };

  createDbTask({
    title: title.trim(),
    status,
    priority,
    assignee,
    notes: notes.trim() ? notes.trim() : undefined,
  });

  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function updateTask(id: string, updates: TaskUpdates) {
  const normalized: TaskUpdates = { ...updates };

  // Keep completed timestamp in sync when marking done
  if (normalized.status === 'done' && !normalized.completed) {
    normalized.completed = new Date().toISOString();
  }

  // Empty strings → null for nullable db fields
  if (normalized.notes !== undefined && normalized.notes !== null && String(normalized.notes).trim() === '') {
    normalized.notes = null;
  }
  if (normalized.content !== undefined && normalized.content !== null && String(normalized.content).trim() === '') {
    normalized.content = null;
  }

  const updated = updateDbTask(id, normalized as Parameters<typeof updateDbTask>[1]);
  if (!updated) return { error: 'Task not found' };

  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function updateTaskStatus(id: string, newStatus: string) {
  return updateTask(id, { status: newStatus as Task['status'] });
}

export async function removeTask(id: string) {
  deleteDbTask(id);
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

// Pipeline actions remain markdown-backed for now
export async function createPipelineItem(formData: FormData) {
  const { savePipelineItem } = await import('@/lib/content');

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
