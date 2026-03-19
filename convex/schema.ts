import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(), // Unix ms
    actor: v.string(), // Molty | Tom | Codex | Ministral | Perplexity | Gemini
    action: v.string(), // shipped | committed | deployed | researched | reviewed | delegated | posted | searched | fixed | planned | ops
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()), // completed | failed | in-progress
    taskRef: v.optional(v.string()),
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

  employees: defineTable({
    name: v.string(),
    agentId: v.optional(v.string()), // OpenClaw agent id: "default", "social-manager", "engineering-manager", or null for external tools
    role: v.string(),
    model: v.string(),
    status: v.string(), // idle | working | offline | error
    currentTask: v.optional(v.string()),
    lastActiveAt: v.optional(v.number()),
    tasksCompleted: v.number(),
    costType: v.string(), // free | subscription | per-token | per-query
    costToDateUSD: v.optional(v.number()),
    tokensToDate: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"])
    .searchIndex("search_employee", {
      searchField: "name",
      filterFields: ["status", "role"],
    }),

  agentControls: defineTable({
    agentId: v.string(), // matches employee name or openclaw agent id
    paused: v.boolean(),
    pausedAt: v.optional(v.number()),
    pausedReason: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_agentId", ["agentId"]),

  briefingConfig: defineTable({
    briefingType: v.string(), // "am" | "pm"
    sections: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        enabled: v.boolean(),
      })
    ),
    newsTopics: v.optional(v.array(v.string())),
    updatedAt: v.number(),
  })
    .index("by_type", ["briefingType"]),

  cronJobs: defineTable({
    jobId: v.string(), // OpenClaw cron job UUID
    name: v.string(),
    agentId: v.string(), // "main", "default", "social-manager", "engineering-manager"
    schedule: v.string(), // cron expression e.g. "0 7 * * *"
    tz: v.optional(v.string()),
    enabled: v.boolean(),
    lastRunAtMs: v.optional(v.number()),
    lastStatus: v.optional(v.string()), // "ok" | "error"
    consecutiveErrors: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_agentId", ["agentId"]),

  backlogTasks: defineTable({
    taskId: v.string(), // BL-001 etc
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.string(),
    status: v.string(), // todo | done | blocked
    priority: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    output: v.optional(v.string()),
    pr: v.optional(v.string()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "assignedTo"],
    }),
});
