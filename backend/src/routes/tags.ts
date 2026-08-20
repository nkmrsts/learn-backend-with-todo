import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { tags } from "../db/schema.js";

const app = new Hono();

app.get("/", async (c) => {
  const result = await db.select().from(tags);
  return c.json(result);
});

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db.select().from(tags).where(eq(tags.id, id));
  return c.json(result);
});

app.post("/", async (c) => {
  const body = await c.req.json<{
    user_id: number;
    name: string;
  }>();

  const result = await db.insert(tags).values(body).returning();

  return c.json(result[0], 201);
});

app.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json<{
    user_id: number;
    name: string;
  }>();

  const result = await db
    .update(tags)
    .set(body)
    .where(eq(tags.id, id))
    .returning();

  return c.json(result[0]);
});

app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db.delete(tags).where(eq(tags.id, id)).returning();

  return c.json(result[0]);
});

export default app;
