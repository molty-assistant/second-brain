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
  const { getTasks, saveTask } = await import('@/lib/content');
  const tasks = getTasks();
  const task = tasks.find(t => t.slug === slug);
  
  if (!task) return { error: 'Task not found' };
  
  const updatedTask = { ...task, ...updates };
  
  // Set completed date if moving to done
  if (updates.status === 'done' && !updatedTask.completed) {
    updatedTask.completed = new Date().toISOString().split('T')[0];
  }
  
  saveTask(updatedTask as Partial<Task> & { title: string; status: string });
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function updateTaskStatus(slug: string, newStatus: string) {
  return updateTask(slug, { status: newStatus as Task['status'] });
}

export async function removeTask(slug: string) {
  deleteTask(slug);
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function createPipelineItem(formData: FormData) {
  const title = formData.get('title') as string;
  const type = formData.get('type') as string || 'post';
  const status = formData.get('status') as string || 'ideas';
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
  
  savePipelineItem({ ...item, status: newStatus });
  revalidatePath('/content');
  revalidatePath('/');
  return { success: true };
}
