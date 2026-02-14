import { queryGeneric } from "convex/server";
import { v } from "convex/values";

export const globalSearch = queryGeneric({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = args.q.trim();
    const limit = Math.min(args.limit ?? 10, 50);
    if (!q) {
      return { activities: [], scheduledTasks: [], employees: [] };
    }

    const activities = await ctx.db
      .query("activities")
      .withSearchIndex("search_summary_detail", (s: any) => s.search("summary", q))
      .take(limit);

    const scheduledTasks = await ctx.db
      .query("scheduledTasks")
      .withSearchIndex("search_name_description", (s: any) => s.search("name", q))
      .take(limit);

    const employees = await ctx.db
      .query("employees")
      .withSearchIndex("search_employee", (s: any) => s.search("name", q))
      .take(limit);

    return { activities, scheduledTasks, employees };
  },
});
