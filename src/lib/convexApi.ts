import { makeFunctionReference } from "convex/server";

// Minimal FunctionReferences without running `npx convex codegen`.
// When Convex is initialized, you can switch to importing from `convex/_generated/api`.
export const convexApi = {
  activities: {
    list: makeFunctionReference("activities:list"),
    log: makeFunctionReference("activities:log"),
    logBatch: makeFunctionReference("activities:logBatch"),
  },
  scheduledTasks: {
    list: makeFunctionReference("scheduledTasks:list"),
    listBetween: makeFunctionReference("scheduledTasks:listBetween"),
    create: makeFunctionReference("scheduledTasks:create"),
    update: makeFunctionReference("scheduledTasks:update"),
  },
  employees: {
    list: makeFunctionReference("employees:list"),
    seed: makeFunctionReference("employees:seed"),
    updateStatus: makeFunctionReference("employees:updateStatus"),
  },
  search: {
    globalSearch: makeFunctionReference("search:globalSearch"),
  },
} as const;
