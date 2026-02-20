import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

// NOTE: This module is consumed by the Mission Control calendar UI.
// Keep function names aligned with src/lib/convexApi.ts.

export const listBetween = queryGeneric({
  args: {
    start: v.number(),
    end: v.number(),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 500, 2000);

    // Convex doesn't support "between" range queries on this index directly,
    // so we over-fetch and filter in memory.
    const rows = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduled")
      .order("asc")
      .take(limit * 3);

    let filtered = rows.filter((t: any) => t.scheduledAt >= args.start && t.scheduledAt <= args.end);
    if (args.status) filtered = filtered.filter((t: any) => t.status === args.status);
    if (args.assignedTo) filtered = filtered.filter((t: any) => t.assignedTo === args.assignedTo);

    return filtered.slice(0, limit);
  },
});

export const listUpcoming = queryGeneric({
  args: {
    from: v.optional(v.number()),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const from = args.from ?? Date.now();
    const limit = Math.min(args.limit ?? 200, 1000);

    const rows = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduled")
      .order("asc")
      .take(limit * 3);

    let filtered = rows.filter((t: any) => t.scheduledAt >= from);
    if (args.status) filtered = filtered.filter((t: any) => t.status === args.status);
    if (args.assignedTo) filtered = filtered.filter((t: any) => t.assignedTo === args.assignedTo);

    return filtered.slice(0, limit);
  },
});

export const list = queryGeneric({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    fromMs: v.optional(v.number()),
    toMs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 200, 1000);

    const rows = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduled")
      .order("asc")
      .take(limit * 3);

    let filtered = rows;
    if (args.status) filtered = filtered.filter((t: any) => t.status === args.status);
    if (args.assignedTo) filtered = filtered.filter((t: any) => t.assignedTo === args.assignedTo);
    if (args.fromMs) filtered = filtered.filter((t: any) => t.scheduledAt >= args.fromMs!);
    if (args.toMs) filtered = filtered.filter((t: any) => t.scheduledAt <= args.toMs!);

    return filtered.slice(0, limit);
  },
});

export const upsert = mutationGeneric({
  args: {
    // Natural key for scheduled tasks coming from OpenClaw crons.
    cronJobId: v.string(),

    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    endAt: v.optional(v.number()),
    recurrence: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.string(),
    project: v.optional(v.string()),
    source: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_cronJobId", (q) => q.eq("cronJobId", args.cronJobId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        scheduledAt: args.scheduledAt,
        endAt: args.endAt,
        recurrence: args.recurrence,
        status: args.status ?? existing.status,
        assignedTo: args.assignedTo,
        project: args.project,
        source: args.source,
        cronJobId: args.cronJobId,
        metadata: args.metadata,
      });
      return await ctx.db.get(existing._id);
    }

    const id = await ctx.db.insert("scheduledTasks", {
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

    return await ctx.db.get(id);
  },
});
