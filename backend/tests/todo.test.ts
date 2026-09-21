import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  transaction: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../src/db/client.js", () => ({
  db: mockDb,
}));

import todos from "../src/routes/todos.js";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Todo 正常系", () => {
  const todo = {
    id: 1,
    user_id: 1,
    title: "テストTODO",
    is_done: false,
    due_date: "2026-09-30",
    created_at: new Date("2026-09-21T00:00:00.000Z"),
    updated_at: new Date("2026-09-21T00:00:00.000Z"),
  };

  const tag = {
    id: 1,
    name: "勉強",
  };

  const expectedTodo = {
    ...todo,
    created_at: "2026-09-21T00:00:00.000Z",
    updated_at: "2026-09-21T00:00:00.000Z",
    tags: [tag],
  };

  it("GET /todos でTodo一覧を取得できる", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockResolvedValue([
            {
              todo,
              tag,
            },
          ]),
        }),
      }),
    });

    const res = await todos.request("/");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([expectedTodo]);
  });

  it("GET /todos/:id でTodoを取得できる", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                todo,
                tag,
              },
            ]),
          }),
        }),
      }),
    });

    const res = await todos.request("/1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expectedTodo);
  });

  it("POST /todos でTodoを作成できる", async () => {
    const tx = {
      insert: vi
        .fn()
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([todo]),
          }),
        })
        .mockReturnValueOnce({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([tag]),
          }),
        }),
      }),
    };

    mockDb.transaction.mockImplementation(
      async (callback: (tx: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        title: "テストTODO",
        due_date: "2026-09-30",
        tag_ids: [1],
      }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(expectedTodo);
  });

  it("PATCH /todos/:id でTodoを更新できる", async () => {
    const updatedTodo = {
      ...todo,
      title: "更新後のTODO",
    };

    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedTodo]),
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([tag]),
          }),
        }),
      }),
    };

    mockDb.transaction.mockImplementation(
      async (callback: (tx: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const res = await todos.request("/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "更新後のTODO",
      }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ...expectedTodo,
      title: "更新後のTODO",
    });
  });

  it("DELETE /todos/:id でTodoを削除できる", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([todo]),
      }),
    });

    const res = await todos.request("/1", {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });
});

describe("Todo 404", () => {
  it("GET /todos/:id でTodoが存在しない場合は404になる", async () => {
    const where = vi.fn().mockResolvedValue([]);
    const secondLeftJoin = vi.fn().mockReturnValue({ where });
    const firstLeftJoin = vi.fn().mockReturnValue({
      leftJoin: secondLeftJoin,
    });
    const from = vi.fn().mockReturnValue({
      leftJoin: firstLeftJoin,
    });

    mockDb.select.mockReturnValue({ from });

    const res = await todos.request("/999");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: "Todo not found",
    });
  });

  it("PATCH /todos/:id でTodoが存在しない場合は404になる", async () => {
    const tx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    mockDb.transaction.mockImplementation(
      async (callback: (tx: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const res = await todos.request("/999", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "更新後のタイトル",
      }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: "Todo not found",
    });
  });

  it("DELETE /todos/:id でTodoが存在しない場合は404になる", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await todos.request("/999", {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: "Todo not found",
    });
  });
});

describe("POST /todos", () => {
  /* 異常系 */
  it("titleが空白スペースのみの場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        title: " ",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("user_idが小数の場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1.5,
        title: "テストケース",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("user_idが0の場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 0,
        title: "テストケース",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("due_dateがYYYY-MM-DD形式でない場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        title: "テストケース",
        due_date: "abc",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("tag_idsに重複がある場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        title: "テストケース",
        tag_ids: [1, 1],
      }),
    });

    expect(res.status).toBe(400);
  });

  it("tag_idsに小数が含まれる場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        title: "テストケース",
        tag_ids: [1.5],
      }),
    });

    expect(res.status).toBe(400);
  });

  it("tag_idsに0が含まれる場合はValidation Errorになる", async () => {
    const res = await todos.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        title: "テストケース",
        tag_ids: [0],
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /todos", () => {
  /* UpdateTodoSchema, IdParamSchema を確認 */
  describe("PATCH /todos/:id", () => {
    it("更新項目がない場合はValidation Errorになる", async () => {
      const res = await todos.request("/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("titleが空白スペースのみの場合はValidation Errorになる", async () => {
      const res = await todos.request("/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: " ",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("due_dateがYYYY-MM-DD形式でない場合はValidation Errorになる", async () => {
      const res = await todos.request("/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          due_date: "abc",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("tag_idsに重複がある場合はValidation Errorになる", async () => {
      const res = await todos.request("/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_ids: [1, 1],
        }),
      });

      expect(res.status).toBe(400);
    });
  });
});

describe("GET /todos", () => {
  describe("GET /todos/:id", () => {
    it("idが整数でない場合はValidation Errorになる", async () => {
      const res = await todos.request("/abc");

      expect(res.status).toBe(400);
    });

    it("idが0の場合はValidation Errorになる", async () => {
      const res = await todos.request("/0");

      expect(res.status).toBe(400);
    });
  });
});
