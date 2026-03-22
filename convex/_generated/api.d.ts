/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as agentControls from "../agentControls.js";
import type * as backlog from "../backlog.js";
import type * as briefingConfig from "../briefingConfig.js";
import type * as cronJobs from "../cronJobs.js";
import type * as dailyLogs from "../dailyLogs.js";
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as scheduledTasks from "../scheduledTasks.js";
import type * as search from "../search.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  agentControls: typeof agentControls;
  backlog: typeof backlog;
  briefingConfig: typeof briefingConfig;
  cronJobs: typeof cronJobs;
  dailyLogs: typeof dailyLogs;
  employees: typeof employees;
  http: typeof http;
  scheduledTasks: typeof scheduledTasks;
  search: typeof search;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
