import { query } from "./_generated/server";
import { v } from "convex/values";

export const globalSearch = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = args.q.trim();
    const limit = Math.min(args.limit ?? 10, 50);
    if (!q) {
      return { activities: [], scheduledTasks: [], employees: [], backlogTasks: [] };
    }

    const activities = await ctx.db
      .query("activities")
      .withSearchIndex("search_title", (s) => s.search("title", q))
      .take(limit);

    const scheduledTasks = await ctx.db
      .query("scheduledTasks")
      .withSearchIndex("search_title", (s) => s.search("title", q))
      .take(limit);

    const employees = await ctx.db
      .query("employees")
      .withSearchIndex("search_employee", (s) => s.search("name", q))
      .take(limit);

    const backlogTasks = await ctx.db
      .query("backlogTasks")
      .withSearchIndex("search_title", (s) => s.search("title", q))
      .take(limit);

    return { activities, scheduledTasks, employees, backlogTasks };
  },
});
