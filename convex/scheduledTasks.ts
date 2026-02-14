import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    fromMs: v.optional(v.number()),
    toMs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const q = ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduled")
      .order("asc");

    const results = await q.take(limit * 3);

    let filtered = results;
    if (args.status) filtered = filtered.filter((t) => t.status === args.status);
    if (args.assignedTo)
      filtered = filtered.filter((t) => t.assignedTo === args.assignedTo);
    if (args.fromMs) filtered = filtered.filter((t) => t.scheduledAt >= args.fromMs!);
    if (args.toMs) filtered = filtered.filter((t) => t.scheduledAt <= args.toMs!);

    return filtered.slice(0, limit);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    endAt: v.optional(v.number()),
    recurrence: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.string(),
    project: v.optional(v.string()),
    source: v.string(),
    cronJobId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledTasks", {
      title: args.title,
      description: args.description,
      scheduledAt: args.scheduledAt,
      endAt: args.endAt,
      recurrence: args.recurrence,
      status: args.status ?? "pending",
      assignedTo: args.assignedTo,
      project: args.project,
      source: args.source,
      cronJobId: args.cronJobId,
      metadata: args.metadata,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("scheduledTasks"),
    status: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("scheduledTasks")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(args.limit ?? 20);
    return results;
  },
});
