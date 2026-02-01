'use server';

import { saveTask, deleteTask, savePipelineItem } from '@/lib/content';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const status = formData.get('status') as string || 'now';
  const assignee = formData.get('assignee') as 'tom' | 'molty' || 'tom';
  const notes = formData.get('notes') as string;
  
  if (!title) return { error: 'Title is required' };
  
  saveTask({ title, status, assignee, notes });
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
}

export async function updateTaskStatus(slug: string, newStatus: string) {
  const { getTasks, saveTask } = await import('@/lib/content');
  const tasks = getTasks();
  const task = tasks.find(t => t.slug === slug);
  
  if (!task) return { error: 'Task not found' };
  
  saveTask({ ...task, status: newStatus });
  revalidatePath('/tasks');
  revalidatePath('/');
  return { success: true };
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
