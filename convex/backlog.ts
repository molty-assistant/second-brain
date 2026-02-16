import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Keep this simple: fetch all then filter; dataset is small.
    const results = await ctx.db
      .query("backlogTasks")
      .withIndex("by_taskId")
      .collect();

    let filtered = results;
    if (args.status) filtered = filtered.filter((t) => t.status === args.status);
    if (args.assignedTo) filtered = filtered.filter((t) => t.assignedTo === args.assignedTo);

    return filtered;
  },
});

export const sync = mutation({
  args: {
    tasks: v.array(
      v.object({
        taskId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        assignedTo: v.string(),
        status: v.string(),
        priority: v.optional(v.string()),
        createdBy: v.optional(v.string()),
        createdAt: v.optional(v.string()),
        completedAt: v.optional(v.string()),
        output: v.optional(v.string()),
        pr: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let upserted = 0;

    for (const task of args.tasks) {
      const existing = await ctx.db
        .query("backlogTasks")
        .withIndex("by_taskId", (q) => q.eq("taskId", task.taskId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          status: task.status,
          priority: task.priority,
          createdBy: task.createdBy,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
          output: task.output,
          pr: task.pr,
        });
      } else {
        await ctx.db.insert("backlogTasks", task);
      }

      upserted++;
    }

    return { upserted };
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("backlogTasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .unique();

    if (!existing) {
      throw new Error(`backlog task not found: ${args.taskId}`);
    }

    await ctx.db.patch(existing._id, { status: args.status });
    return { ok: true };
  },
});
