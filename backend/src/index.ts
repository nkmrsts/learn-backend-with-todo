import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import todos from "./routes/todos.js";
import tags from "./routes/tags.js";

const app = new OpenAPIHono();

app.route("/todos", todos);
app.route("/tags", tags);

app.notFound((c) => {
  return c.json({ message: "Not Found", ok: false }, 404);
});

app.onError((err, c) => {
  console.error(err);

  return c.json({ message: "Internal Server Error", ok: false }, 500);
});

// The OpenAPI documentation will be available at /doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

// Use the middleware to serve Swagger UI at /swagger
app.get("/swagger", swaggerUI({ url: "/doc" }));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
