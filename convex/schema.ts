import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(), // Unix ms
    actor: v.string(), // Molty | Tom | Codex | Ministral | Perplexity | Gemini
    action: v.string(), // shipped | committed | deployed | researched | reviewed | delegated | posted | searched | fixed | planned | ops
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
    .index("by_cronJobId", ["cronJobId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "assignedTo", "project"],
    }),

  employees: defineTable({
    name: v.string(),
    role: v.string(),
    model: v.string(),
    status: v.string(), // idle | working | offline | error
    currentTask: v.optional(v.string()),
    lastActiveAt: v.optional(v.number()),
    tasksCompleted: v.number(),
    costType: v.string(), // free | subscription | per-token | per-query
  })
    .index("by_name", ["name"])
    .index("by_status", ["status"])
    .searchIndex("search_employee", {
      searchField: "name",
      filterFields: ["status", "role"],
    }),

  workOrders: defineTable({
    id: v.string(),
    title: v.string(),
    priority: v.union(v.literal("now"), v.literal("next"), v.literal("later")),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    worker: v.union(
      v.literal("codex"),
      v.literal("claude"),
      v.literal("lmstudio"),
      v.literal("molty")
    ),
    repo: v.optional(v.string()),
    acceptance: v.array(v.string()),
    constraints: v.array(v.string()),
    links: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_id", ["id"])
    .index("by_createdAt", ["createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_priority", ["priority", "createdAt"])
    .index("by_worker", ["worker", "createdAt"]),
});
