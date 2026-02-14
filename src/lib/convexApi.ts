import { makeFunctionReference } from "convex/server";

// Minimal FunctionReferences without running `npx convex codegen`.
// When Convex is initialized, you can switch to importing from `convex/_generated/api`.
export const convexApi = {
  activities: {
    list: makeFunctionReference("activities:list"),
    logActivity: makeFunctionReference("activities:logActivity"),
  },
  scheduledTasks: {
    listBetween: makeFunctionReference("scheduledTasks:listBetween"),
    listUpcoming: makeFunctionReference("scheduledTasks:listUpcoming"),
    upsert: makeFunctionReference("scheduledTasks:upsert"),
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
