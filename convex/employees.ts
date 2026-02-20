import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("employees").withIndex("by_name").collect();
    return items.sort((a: any, b: any) => a.name.localeCompare(b.name));
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
        role: "CEO/Strategist",
        model: "claude-opus-4-6",
        status: "idle",
        currentTask: undefined,
        lastActiveAt: now,
        tasksCompleted: 0,
        costType: "subscription",
      },
      {
        name: "Codex",
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
