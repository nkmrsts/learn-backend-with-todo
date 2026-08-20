import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { todos, todoTags } from "../db/schema.js";

const app = new Hono();

app.get("/", async (c) => {
  const result = await db.select().from(todos);
  return c.json(result);
});

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db.select().from(todos).where(eq(todos.id, id));
  return c.json(result);
});

app.post("/", async (c) => {
  const body = await c.req.json<{
    user_id: number;
    title: string;
    due_date?: string;
    tag_ids?: number[];
  }>();

  const result = await db.transaction(async (tx) => {
    const [todo] = await tx
      .insert(todos)
      .values({
        user_id: body.user_id,
        title: body.title,
        due_date: body.due_date,
      })
      .returning();

    if (body.tag_ids && body.tag_ids.length > 0) {
      await tx.insert(todoTags).values(
        body.tag_ids.map((tag_id) => ({
          todo_id: todo.id,
          tag_id,
        })),
      );
    }

    return todo;
  });

  return c.json(result, 201);
});

app.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json<{
    title?: string;
    is_done?: boolean;
    due_date?: string | null;
    tag_ids?: number[];
  }>();

  const { tag_ids, ...todoValues } = body;

  const result = await db.transaction(async (tx) => {
    const [todo] = await tx
      .update(todos)
      .set(todoValues)
      .where(eq(todos.id, id))
      .returning();

    if (tag_ids !== undefined) {
      await tx.delete(todoTags).where(eq(todoTags.todo_id, id));

      if (tag_ids.length > 0) {
        await tx.insert(todoTags).values(
          tag_ids.map((tag_id) => ({
            todo_id: id,
            tag_id,
          })),
        );
      }
    }

    return todo;
  });

  return c.json(result, 201);
});

app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db.delete(todos).where(eq(todos.id, id)).returning();

  return c.json(result[0]);
});

export default app;
