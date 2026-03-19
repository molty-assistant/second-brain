import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// External logging endpoint (optional):
// POST https://<deployment>.convex.site/log-activity
// Body: { actor, action, title, description?, project?, tags?, metadata?, status?, taskRef?, timestamp? }
http.route({
  path: "/log-activity",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const id = await ctx.runMutation(api.activities.log, body);
    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Update employee status by name
// POST https://<deployment>.convex.site/update-employee-status
// Body: { name, status, currentTask?, lastActiveAt?, tasksCompletedDelta? }
http.route({
  path: "/update-employee-status",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const result = await ctx.runMutation(
      api.employees.updateStatusByName,
      body
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Log cost against an employee
// POST https://<deployment>.convex.site/log-cost
// Body: { name, costUSD, tokens }
http.route({
  path: "/log-cost",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const result = await ctx.runMutation(api.employees.logCost, body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Check if an agent is paused (for agents to check before running)
// GET https://<deployment>.convex.site/agent-control?agentId=default
// Accepts agentId (openclaw id) or display name
http.route({
  path: "/agent-control",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const agentId = url.searchParams.get("agentId");
    if (!agentId) {
      return new Response(JSON.stringify({ error: "agentId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const control = await ctx.runQuery(api.agentControls.get, { agentId });
    return new Response(
      JSON.stringify(control ?? { agentId, paused: false }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// List all agent controls (for sync tool to read all pause states at once)
// GET https://<deployment>.convex.site/agent-controls
http.route({
  path: "/agent-controls",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const controls = await ctx.runQuery(api.agentControls.list, {});
    return new Response(JSON.stringify(controls), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Get briefing config for a type (for cron jobs to read enabled sections)
// GET https://<deployment>.convex.site/briefing-config?type=am
http.route({
  path: "/briefing-config",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const briefingType = url.searchParams.get("type") || "am";
    const config = await ctx.runQuery(api.briefingConfig.get, { briefingType });
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
