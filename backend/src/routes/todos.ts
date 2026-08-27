import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { todos, todoTags, tags } from "../db/schema.js";
import {
  TodoSchema,
  TodosSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
} from "../schemas/todo.js";
import { IdParamSchema } from "../schemas/common.js";

const app = new OpenAPIHono();

type TodoResponse = z.infer<typeof TodoSchema>;

const getTodosRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TodosSchema,
        },
      },
      description: "Get todos",
    },
  },
});

app.openapi(getTodosRoute, async (c) => {
  const rows = await db
    .select({
      todo: todos,
      tag: {
        id: tags.id,
        name: tags.name,
      },
    })
    .from(todos)
    .leftJoin(todoTags, eq(todos.id, todoTags.todo_id))
    .leftJoin(tags, eq(todoTags.tag_id, tags.id));

  const todoMap = new Map<number, TodoResponse>();

  for (const row of rows) {
    if (!todoMap.has(row.todo.id)) {
      // created_at, updated_atはDateなので明示的にResponseの型(string)へ変換する
      todoMap.set(row.todo.id, {
        ...row.todo,
        created_at: row.todo.created_at.toISOString(),
        updated_at: row.todo.updated_at.toISOString(),
        tags: [],
      });
    }

    if (row.tag) {
      todoMap.get(row.todo.id)?.tags.push(row.tag);
    }
  }

  const result = Array.from(todoMap.values());

  return c.json(result, 200);
});

const getTodoRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
      description: "Get todo",
    },
    404: {
      content: {
        "application/json": {
          schema: z.null(),
        },
      },
      description: "Todo not found",
    },
  },
});

app.openapi(getTodoRoute, async (c) => {
  const id = Number(c.req.valid("param"));
  const rows = await db
    .select({
      todo: todos,
      tag: {
        id: tags.id,
        name: tags.name,
      },
    })
    .from(todos)
    .leftJoin(todoTags, eq(todos.id, todoTags.todo_id))
    .leftJoin(tags, eq(todoTags.tag_id, tags.id))
    .where(eq(todos.id, id));

  if (rows.length === 0) {
    return c.json(null, 404);
  }

  const result = {
    ...rows[0].todo,
    created_at: rows[0].todo.created_at.toISOString(),
    updated_at: rows[0].todo.updated_at.toISOString(),
    tags: rows.flatMap((row) => (row.tag !== null ? [row.tag] : [])),
  };

  return c.json(result, 200);
});

const postTodoRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateTodoSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
      description: "Create todo",
    },
  },
});

app.openapi(postTodoRoute, async (c) => {
  const body = c.req.valid("json");

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

    const todoTagList = await tx
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(todoTags)
      .innerJoin(tags, eq(todoTags.tag_id, tags.id))
      .where(eq(todoTags.todo_id, todo.id));

    return {
      ...todo,
      created_at: todo.created_at.toISOString(),
      updated_at: todo.updated_at.toISOString(),
      tags: todoTagList,
    };
  });

  return c.json(result, 201);
});

const patchTodoRoute = createRoute({
  method: "patch",
  path: "/{id}",
  request: {
    params: IdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateTodoSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
      description: "Update todo",
    },
  },
});

app.openapi(patchTodoRoute, async (c) => {
  const id = Number(c.req.valid("param"));
  const body = c.req.valid("json");

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

    const todoTagList = await tx
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(todoTags)
      .innerJoin(tags, eq(todoTags.tag_id, tags.id))
      .where(eq(todoTags.todo_id, id));

    return {
      ...todo,
      created_at: todo.created_at.toISOString(),
      updated_at: todo.updated_at.toISOString(),
      tags: todoTagList,
    };
  });

  return c.json(result, 201);
});

const deleteTodoRoute = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: IdParamSchema,
  },
  responses: {
    204: {
      description: "Delete todo",
    },
  },
});

app.openapi(deleteTodoRoute, async (c) => {
  const id = Number(c.req.valid("param"));
  await db.delete(todos).where(eq(todos.id, id));

  return c.body(null, 204);
});

export default app;
