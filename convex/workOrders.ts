import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const priorityValue = v.union(v.literal("now"), v.literal("next"), v.literal("later"));
const statusValue = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("done"),
  v.literal("blocked")
);
const workerValue = v.union(
  v.literal("codex"),
  v.literal("claude"),
  v.literal("lmstudio"),
  v.literal("molty")
);

function cleanLines(items: string[] | undefined) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
}

function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildGeneratedId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WO-${stamp}-${rand}`;
}

export const create = mutationGeneric({
  args: {
    id: v.optional(v.string()),
    title: v.string(),
    priority: v.optional(priorityValue),
    status: v.optional(statusValue),
    worker: v.optional(workerValue),
    repo: v.optional(v.string()),
    acceptance: v.optional(v.array(v.string())),
    constraints: v.optional(v.array(v.string())),
    links: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title) throw new Error("Title is required");

    const id = normalizeOptionalText(args.id) ?? buildGeneratedId();
    const existing = await ctx.db
      .query("workOrders")
      .withIndex("by_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      throw new Error(`Work Order with id '${id}' already exists`);
    }

    const now = Date.now();
    const acceptance = cleanLines(args.acceptance);
    const constraints = cleanLines(args.constraints);
    const links = cleanLines(args.links);

    const insertedId = await ctx.db.insert("workOrders", {
      id,
      title,
      priority: args.priority ?? "next",
      status: args.status ?? "todo",
      worker: args.worker ?? "codex",
      repo: normalizeOptionalText(args.repo),
      acceptance,
      constraints,
      links: links.length > 0 ? links : undefined,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(insertedId);
  },
});

export const update = mutationGeneric({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    priority: v.optional(priorityValue),
    status: v.optional(statusValue),
    worker: v.optional(workerValue),
    repo: v.optional(v.string()),
    acceptance: v.optional(v.array(v.string())),
    constraints: v.optional(v.array(v.string())),
    links: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("workOrders")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();
    if (!doc) throw new Error("Work Order not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("Title cannot be empty");
      patch.title = title;
    }
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.status !== undefined) patch.status = args.status;
    if (args.worker !== undefined) patch.worker = args.worker;
    if (args.repo !== undefined) patch.repo = args.repo.trim();
    if (args.acceptance !== undefined) patch.acceptance = cleanLines(args.acceptance);
    if (args.constraints !== undefined) patch.constraints = cleanLines(args.constraints);
    if (args.links !== undefined) patch.links = cleanLines(args.links);

    await ctx.db.patch(doc._id, patch);
    return await ctx.db.get(doc._id);
  },
});

export const list = queryGeneric({
  args: {
    status: v.optional(statusValue),
    priority: v.optional(priorityValue),
    worker: v.optional(workerValue),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 200, 500);
    const rows = await ctx.db
      .query("workOrders")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit * 3);

    let filtered = rows;
    if (args.status) filtered = filtered.filter((row) => row.status === args.status);
    if (args.priority) filtered = filtered.filter((row) => row.priority === args.priority);
    if (args.worker) filtered = filtered.filter((row) => row.worker === args.worker);

    return filtered.slice(0, limit);
  },
});

export const get = queryGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workOrders")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();
  },
});
