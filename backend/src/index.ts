import { serve } from "@hono/node-server";
import { Hono } from "hono";
import todos from "./routes/todos.js";
import tags from "./routes/tags.js";

const app = new Hono();

app.route("/todos", todos);
app.route("/tags", tags);

app.notFound((c) => {
  return c.json({ message: "Not Found", ok: false }, 404);
});

app.onError((err, c) => {
  console.error(err);

  return c.json({ message: "Internal Server Error", ok: false }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
