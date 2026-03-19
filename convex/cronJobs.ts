import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cronJobs").collect();
  },
});

export const upsert = mutation({
  args: {
    jobId: v.string(),
    name: v.string(),
    agentId: v.string(),
    schedule: v.string(),
    tz: v.optional(v.string()),
    enabled: v.boolean(),
    lastRunAtMs: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
    consecutiveErrors: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cronJobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .take(1);

    const now = Date.now();

    if (existing.length > 0) {
      // Don't overwrite enabled if user toggled it from dashboard
      // Only sync daemon should call with the current file state
      await ctx.db.patch(existing[0]._id, {
        name: args.name,
        agentId: args.agentId,
        schedule: args.schedule,
        tz: args.tz,
        lastRunAtMs: args.lastRunAtMs,
        lastStatus: args.lastStatus,
        consecutiveErrors: args.consecutiveErrors,
        updatedAt: now,
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("cronJobs", {
      ...args,
      updatedAt: now,
    });
  },
});

export const setEnabled = mutation({
  args: {
    jobId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cronJobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .take(1);

    if (existing.length === 0) {
      throw new Error(`Cron job not found: ${args.jobId}`);
    }

    await ctx.db.patch(existing[0]._id, {
      enabled: args.enabled,
      updatedAt: Date.now(),
    });

    return existing[0]._id;
  },
});
