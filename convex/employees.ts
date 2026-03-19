import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("employees").withIndex("by_name").collect();
    return items.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("employees").take(1);
    if (existing.length > 0) return { seeded: false };

    const now = Date.now();
    const employees = [
      {
        name: "Molty",
        agentId: "default",
        role: "CEO/Strategist",
        model: "claude-opus-4-6",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "subscription",
      },
      {
        name: "Eddy",
        agentId: "engineering-manager",
        role: "Engineering Manager",
        model: "claude-opus-4-6",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "subscription",
      },
      {
        name: "Sid",
        agentId: "social-manager",
        role: "Social Media Manager",
        model: "claude-opus-4-6",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "subscription",
      },
      {
        name: "Codex",
        agentId: undefined,
        role: "Senior Engineer",
        model: "gpt-5.2",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "subscription",
      },
      {
        name: "Ministral 3B",
        agentId: undefined,
        role: "Copy Editor",
        model: "mistralai/ministral-3-3b",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "free",
      },
      {
        name: "Perplexity",
        agentId: undefined,
        role: "Research Analyst",
        model: "sonar",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "per-query",
      },
      {
        name: "Gemini",
        agentId: undefined,
        role: "Creative Director",
        model: "gemini-2.5-flash",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "free",
      },
    ];

    for (const e of employees) {
      await ctx.db.insert("employees", e);
    }

    return { seeded: true, count: employees.length };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("employees"),
    status: v.string(),
    currentTask: v.optional(v.string()),
    lastActiveAt: v.optional(v.number()),
    tasksCompletedDelta: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Employee not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      currentTask: args.currentTask,
      lastActiveAt: args.lastActiveAt ?? Date.now(),
      tasksCompleted: doc.tasksCompleted + (args.tasksCompletedDelta ?? 0),
    });
    return true;
  },
});

// Resolve an employee by name OR agentId (agents use agentId, humans use name)
async function resolveEmployee(ctx: QueryCtx | MutationCtx, identifier: string) {
  // Try agentId first (e.g. "default", "social-manager", "engineering-manager")
  const byAgent = await ctx.db
    .query("employees")
    .withIndex("by_agentId", (q) => q.eq("agentId", identifier))
    .take(1);
  if (byAgent.length > 0) return byAgent[0];

  // Fall back to name (e.g. "Molty", "Codex")
  const byName = await ctx.db
    .query("employees")
    .withIndex("by_name", (q) => q.eq("name", identifier))
    .take(1);
  return byName[0] ?? null;
}

// Update status by name or agentId (for external tools that don't know Convex IDs)
export const updateStatusByName = mutation({
  args: {
    name: v.string(), // accepts display name OR agentId
    status: v.string(),
    currentTask: v.optional(v.string()),
    lastActiveAt: v.optional(v.number()),
    tasksCompletedDelta: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const doc = await resolveEmployee(ctx, args.name);
    if (!doc) return { found: false };

    await ctx.db.patch(doc._id, {
      status: args.status,
      currentTask: args.currentTask,
      lastActiveAt: args.lastActiveAt ?? Date.now(),
      tasksCompleted: doc.tasksCompleted + (args.tasksCompletedDelta ?? 0),
    });
    return { found: true, id: doc._id };
  },
});

// Log cost against an employee by name or agentId
export const logCost = mutation({
  args: {
    name: v.string(), // accepts display name OR agentId
    costUSD: v.number(),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const doc = await resolveEmployee(ctx, args.name);
    if (!doc) return { found: false };

    await ctx.db.patch(doc._id, {
      costToDateUSD: (doc.costToDateUSD ?? 0) + args.costUSD,
      tokensToDate: (doc.tokensToDate ?? 0) + args.tokens,
      lastActiveAt: Date.now(),
    });
    return { found: true, id: doc._id };
  },
});

// Get employee by name or agentId
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await resolveEmployee(ctx, args.name);
  },
});
