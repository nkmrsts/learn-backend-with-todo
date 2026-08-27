import { z } from "@hono/zod-openapi";

const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const TodoSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    user_id: z.number().openapi({
      example: 1,
    }),
    title: z.string().openapi({
      example: "タイトル",
    }),
    is_done: z.boolean().openapi({
      example: false,
    }),
    due_date: z.string().nullable().openapi({
      example: "2026-08-30",
    }),
    created_at: z.string().openapi({
      example: "2026-08-27T12:34:56.000Z",
    }),
    updated_at: z.string().openapi({
      example: "2026-08-27T12:34:56.000Z",
    }),
    tags: z.array(TagSchema),
  })
  .openapi("TodoSchema");

// リクエストモデル
export const CreateTodoSchema = z
  .object({
    user_id: z.number(),
    title: z.string(),
    due_date: z.string().optional(),
    tag_ids: z.array(z.number()).optional(),
  })
  .openapi("CreateTodoSchema");

export const UpdateTodoSchema = z
  .object({
    title: z.string().optional(),
    is_done: z.boolean().optional(),
    due_date: z.string().nullable().optional(),
    tag_ids: z.array(z.number()).optional(),
  })
  .openapi("UpdateTodoSchema");

// レスポンスモデル
export const TodosSchema = z.array(TodoSchema).openapi("TodosSchema");
