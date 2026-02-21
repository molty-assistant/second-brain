import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
    actor: v.optional(v.string()),
    action: v.optional(v.string()),
    status: v.optional(v.string()),
    project: v.optional(v.string()),
    afterMs: v.optional(v.number()),
    beforeMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const q = ctx.db.query("activities").withIndex("by_timestamp").order("desc");
    const results = await q.take(limit * 3); // over-fetch for client-side filtering

    let filtered = results;
    if (args.actor) filtered = filtered.filter((a) => a.actor === args.actor);
    if (args.action) filtered = filtered.filter((a) => a.action === args.action);
    if (args.status) filtered = filtered.filter((a) => a.status === args.status);
    if (args.project) filtered = filtered.filter((a) => a.project === args.project);
    if (args.afterMs) filtered = filtered.filter((a) => a.timestamp >= args.afterMs!);
    if (args.beforeMs) filtered = filtered.filter((a) => a.timestamp <= args.beforeMs!);

    return filtered.slice(0, limit);
  },
});

export const log = mutation({
  args: {
    timestamp: v.optional(v.number()),
    actor: v.string(),
    action: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    taskRef: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      timestamp: args.timestamp ?? Date.now(),
      actor: args.actor,
      action: args.action,
      title: args.title,
      description: args.description,
      status: args.status,
      taskRef: args.taskRef,
      project: args.project,
      tags: args.tags,
      metadata: args.metadata,
    });
  },
});

export const logBatch = mutation({
  args: {
    activities: v.array(
      v.object({
        timestamp: v.optional(v.number()),
        actor: v.string(),
        action: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        taskRef: v.optional(v.string()),
        project: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const activity of args.activities) {
      const id = await ctx.db.insert("activities", {
        timestamp: activity.timestamp ?? Date.now(),
        actor: activity.actor,
        action: activity.action,
        title: activity.title,
        description: activity.description,
        status: activity.status,
        taskRef: activity.taskRef,
        project: activity.project,
        tags: activity.tags,
        metadata: activity.metadata,
      });
      ids.push(id);
    }
    return ids;
  },
});

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("activities")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(args.limit ?? 20);
    return results;
  },
});
