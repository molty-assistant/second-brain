import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SECTIONS = [
  { key: "revenue", label: "Revenue Scoreboard", enabled: true },
  { key: "marketing-tool", label: "Marketing Tool Status", enabled: true },
  { key: "workforce", label: "Workforce Snapshot", enabled: true },
  { key: "priorities", label: "Top Priorities", enabled: true },
  { key: "calendar", label: "Calendar", enabled: false },
  { key: "tiktok", label: "TikTok Analytics", enabled: true },
  { key: "niche-news", label: "Niche News", enabled: false },
  { key: "suggestions", label: "Proactive Suggestions", enabled: false },
];

export const get = query({
  args: { briefingType: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("briefingConfig")
      .withIndex("by_type", (q) => q.eq("briefingType", args.briefingType))
      .take(1);

    if (docs.length > 0) return docs[0];

    // Return defaults if no config saved yet
    return {
      _id: null,
      briefingType: args.briefingType,
      sections: DEFAULT_SECTIONS,
      newsTopics: [],
      updatedAt: 0,
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("briefingConfig").collect();

    // Ensure both AM and PM exist in response
    const types = ["am", "pm"];
    const result = [];

    for (const type of types) {
      const existing = configs.find((c) => c.briefingType === type);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          _id: null,
          briefingType: type,
          sections: DEFAULT_SECTIONS,
          newsTopics: [],
          updatedAt: 0,
        });
      }
    }

    return result;
  },
});

export const save = mutation({
  args: {
    briefingType: v.string(),
    sections: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        enabled: v.boolean(),
      })
    ),
    newsTopics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("briefingConfig")
      .withIndex("by_type", (q) => q.eq("briefingType", args.briefingType))
      .take(1);

    const now = Date.now();

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        sections: args.sections,
        newsTopics: args.newsTopics,
        updatedAt: now,
      });
      return existing[0]._id;
    }

    return await ctx.db.insert("briefingConfig", {
      briefingType: args.briefingType,
      sections: args.sections,
      newsTopics: args.newsTopics,
      updatedAt: now,
    });
  },
});
