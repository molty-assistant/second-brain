import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(), // Unix ms
    actor: v.string(), // molty | tom | codex | ministral | perplexity | gemini
    action: v.string(), // shipped | committed | deployed | researched | reviewed | delegated | posted | searched | fixed | planned
    title: v.string(),
    description: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_actor", ["actor", "timestamp"])
    .index("by_action", ["action", "timestamp"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["actor", "action", "project"],
    }),

  scheduledTasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(), // Unix ms
    endAt: v.optional(v.number()),
    recurrence: v.optional(v.string()), // cron expression
    status: v.string(), // pending | running | done | failed | cancelled
    assignedTo: v.string(),
    project: v.optional(v.string()),
    source: v.string(), // cron | manual | heartbeat
    cronJobId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_scheduled", ["scheduledAt"])
    .index("by_status", ["status", "scheduledAt"])
    .index("by_assigned", ["assignedTo", "scheduledAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "assignedTo", "project"],
    }),
});
