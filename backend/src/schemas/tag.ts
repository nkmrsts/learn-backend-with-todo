import { z } from "@hono/zod-openapi";

export const TagSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    user_id: z.number().openapi({
      example: 1,
    }),
    name: z.string().openapi({
      example: "勉強",
    }),
    created_at: z.string().openapi({
      example: "2026-08-27T12:34:56.000Z",
    }),
    updated_at: z.string().openapi({
      example: "2026-08-27T12:34:56.000Z",
    }),
  })
  .openapi("TagSchema");

// リクエストモデル
export const CreateTagSchema = z
  .object({
    user_id: z.number(),
    name: z.string(),
  })
  .openapi("CreateTagSchema");

export const UpdateTagSchema = z
  .object({
    name: z.string(),
  })
  .openapi("UpdateTagSchema");

// レスポンスモデル
export const TagsSchema = z.array(TagSchema).openapi("TagsSchema");
