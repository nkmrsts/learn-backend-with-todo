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
    user_id: z.number().int().positive(),
    title: z.string().refine((value) => value.trim().length > 0, {
      message: "title must not be empty",
    }),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "due_date must be in YYYY-MM-DD format",
      })
      .optional(),
    tag_ids: z
      .array(z.number().int().positive())
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "tag_ids must not contain duplicates",
      })
      .optional(),
  })
  .openapi("CreateTodoSchema");

export const UpdateTodoSchema = z
  .object({
    title: z
      .string()
      .refine((value) => value.trim().length > 0, {
        message: "title must not be empty",
      })
      .optional(),
    is_done: z.boolean().optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "due_date must be in YYYY-MM-DD format",
      })
      .nullable()
      .optional(),
    tag_ids: z
      .array(z.number().int().positive())
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "tag_ids must not contain duplicates",
      })
      .optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided",
  })
  .openapi("UpdateTodoSchema");

// レスポンスモデル
export const TodosSchema = z.array(TodoSchema).openapi("TodosSchema");
