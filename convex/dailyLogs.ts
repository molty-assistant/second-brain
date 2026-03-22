import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    date: v.optional(v.string()), // ISO date "2026-03-22", defaults to today
    summary: v.string(),
    projects: v.optional(v.array(v.string())),
    decisions: v.optional(v.array(v.string())),
    actionItems: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const date =
      args.date ??
      new Date(now).toISOString().slice(0, 10);
    return await ctx.db.insert("dailyLogs", {
      date,
      timestamp: now,
      summary: args.summary,
      projects: args.projects,
      decisions: args.decisions,
      actionItems: args.actionItems,
      tags: args.tags,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyLogs"),
    summary: v.optional(v.string()),
    projects: v.optional(v.array(v.string())),
    decisions: v.optional(v.array(v.string())),
    actionItems: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("dailyLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    project: v.optional(v.string()),
    afterDate: v.optional(v.string()), // ISO date string
    beforeDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const raw = await ctx.db
      .query("dailyLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit * 5);

    let results = raw;

    if (args.project) {
      results = results.filter((l) =>
        l.projects?.some((p) =>
          p.toLowerCase().includes(args.project!.toLowerCase())
        )
      );
    }
    if (args.afterDate) {
      results = results.filter((l) => l.date >= args.afterDate!);
    }
    if (args.beforeDate) {
      results = results.filter((l) => l.date <= args.beforeDate!);
    }

    return results.slice(0, limit);
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .withSearchIndex("search_summary", (q) =>
        q.search("summary", args.query)
      )
      .take(args.limit ?? 20);
  },
});

export const allProjects = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("dailyLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(500);
    const set = new Set<string>();
    for (const log of logs) {
      for (const p of log.projects ?? []) {
        set.add(p);
      }
    }
    return Array.from(set).sort();
  },
});
