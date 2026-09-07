import { z } from "@hono/zod-openapi";

export const IdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, {
      message: "id must be an integer",
    })
    .refine((value) => Number(value) > 0, {
      message: "id must be greater than 0",
    })
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "1",
    }),
});
