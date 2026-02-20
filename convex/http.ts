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

export default http;
