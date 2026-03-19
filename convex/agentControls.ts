import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("agentControls")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .take(1);
    return docs[0] ?? null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agentControls").collect();
  },
});

export const setPaused = mutation({
  args: {
    agentId: v.string(),
    paused: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentControls")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .take(1);

    const now = Date.now();

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        paused: args.paused,
        pausedAt: args.paused ? now : undefined,
        pausedReason: args.paused ? args.reason : undefined,
        updatedAt: now,
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("agentControls", {
      agentId: args.agentId,
      paused: args.paused,
      pausedAt: args.paused ? now : undefined,
      pausedReason: args.paused ? args.reason : undefined,
      updatedAt: now,
    });
  },
});
