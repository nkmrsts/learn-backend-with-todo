import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { tags } from "../db/schema.js";
import {
  TagSchema,
  TagsSchema,
  CreateTagSchema,
  UpdateTagSchema,
} from "../schemas/tag.js";
import { IdParamSchema } from "../schemas/common.js";
import { ErrorResponse } from "../schemas/error.js";

const app = new OpenAPIHono();

const getTagsRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagsSchema,
        },
      },
      description: "Get tags",
    },
  },
});

app.openapi(getTagsRoute, async (c) => {
  const tagsResult = await db.select().from(tags);

  const result = tagsResult.map((tag) => ({
    ...tag,
    created_at: tag.created_at.toISOString(),
    updated_at: tag.updated_at.toISOString(),
  }));
  return c.json(result, 200);
});

const getTagRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagSchema,
        },
      },
      description: "Get tag",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
      description: "Tag not found",
    },
  },
});

app.openapi(getTagRoute, async (c) => {
  const id = Number(c.req.valid("param").id);
  const [tag] = await db.select().from(tags).where(eq(tags.id, id));

  if (!tag) {
    return c.json(
      {
        message: "Tag not found",
      },
      404,
    );
  }

  const result = {
    ...tag,
    created_at: tag.created_at.toISOString(),
    updated_at: tag.updated_at.toISOString(),
  };

  return c.json(result, 200);
});

const postTagRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateTagSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: TagSchema,
        },
      },
      description: "Create tag",
    },
  },
});

app.openapi(postTagRoute, async (c) => {
  const body = c.req.valid("json");

  const [tag] = await db.insert(tags).values(body).returning();

  if (!tag) {
    throw new Error("Failed to create tag");
  }

  const result = {
    ...tag,
    created_at: tag.created_at.toISOString(),
    updated_at: tag.updated_at.toISOString(),
  };

  return c.json(result, 201);
});

const patchTagRoute = createRoute({
  method: "patch",
  path: "/{id}",
  request: {
    params: IdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateTagSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TagSchema,
        },
      },
      description: "Update tag",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
      description: "Tag not found",
    },
  },
});

app.openapi(patchTagRoute, async (c) => {
  const id = Number(c.req.valid("param").id);
  const body = c.req.valid("json");

  const [tag] = await db
    .update(tags)
    .set(body)
    .where(eq(tags.id, id))
    .returning();

  if (!tag) {
    return c.json(
      {
        message: "Tag not found",
      },
      404,
    );
  }

  const result = {
    ...tag,
    created_at: tag.created_at.toISOString(),
    updated_at: tag.updated_at.toISOString(),
  };

  return c.json(result, 200);
});

const deleteTagRoute = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: IdParamSchema,
  },
  responses: {
    204: {
      description: "Delete tag",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
      description: "Tag not found",
    },
  },
});

app.openapi(deleteTagRoute, async (c) => {
  const id = Number(c.req.valid("param").id);
  const [tag] = await db.delete(tags).where(eq(tags.id, id)).returning();

  if (!tag) {
    return c.json(
      {
        message: "Tag not found",
      },
      404,
    );
  }

  return c.body(null, 204);
});

export default app;
